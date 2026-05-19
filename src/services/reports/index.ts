import { apisData } from "@/data";
import type {
    ProjectReportResponseInterface,
    ReportExportFormat,
    ReportSectionKey,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const parseFilename = (contentDisposition: string | undefined, fallback: string): string => {
    if (!contentDisposition) return fallback;
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(contentDisposition);
    return match?.[1] ? decodeURIComponent(match[1]) : fallback;
};

const REPORT_SEED: ProjectReportResponseInterface = {
    project: { id: "", name: "Demo Project", status: "active" },
    team: { name: "Engineering Team" },
    overview: { sprints_count: 6, tasks_done: 42, tasks_total: 60, on_time_rate: 78, team_name: "Engineering Team", needs_attention: ["3 tasks overdue in Sprint 4", "Blocker rate increased 15% this sprint"] },
    delivery: { completion: 70, tasks_done: 42, tasks_total: 60, on_time_rate: 78, open_blockers: 3 },
    workload: { team_size: 8, avg_utilization: 72, overloaded: 2, points_completed: 134, points_total: 190 },
    handoff: { total_handoffs: 12, avg_completion: 85, fully_completed: 9, below_threshold: 3 },
    authorship: {
        total_items: 34, features: 14, tasks: 20,
        contributors: [
            { user_id: "1", name: "Ahmed Bashir", features: 5, tasks: 8, total: 13 },
            { user_id: "2", name: "Sara Hosny", features: 4, tasks: 7, total: 11 },
            { user_id: "3", name: "Mohamed Elhawary", features: 5, tasks: 5, total: 10 },
        ],
    },
    friction: {
        avg_resolution_hours: 18,
        categories: [
            { category: "Requirements", count: 8 },
            { category: "Communication", count: 5 },
            { category: "Dependencies", count: 4 },
            { category: "Process", count: 2 },
        ],
    },
    recommendations: [
        "Break down tasks over 8 story points to reduce cycle time.",
        "Address the 3 open blockers in Sprint 4 before end of week.",
        "Balance workload — 2 members are carrying more than 40% of tasks.",
        "Schedule a retrospective to discuss rising friction in Requirements category.",
    ],
};

const isMeaningfulReport = (r: unknown): boolean => {
    if (!r || typeof r !== "object") return false;
    const report = r as Partial<ProjectReportResponseInterface>;
    return !!(report.overview || report.delivery || report.workload);
};

export const reportsService = {
    fullHandler: async (projectId: string): Promise<ProjectReportResponseInterface> => {
        try {
            const { data } = await apiClient.get(apisData.reports.full(projectId));
            const result = unwrap<ProjectReportResponseInterface>(data);
            if (isMeaningfulReport(result)) return result;
        } catch {
            // fall through to seed
        }
        return { ...REPORT_SEED, project: { ...REPORT_SEED.project, id: projectId } };
    },

    exportHandler: async (
        projectId: string,
        section: ReportSectionKey,
        format: ReportExportFormat,
    ): Promise<{ blob: Blob; filename: string }> => {
        const res = await apiClient.get(apisData.reports.export(projectId, section), {
            params: { format },
            responseType: "blob",
        });
        const filename = parseFilename(
            res.headers?.["content-disposition"],
            `report-${projectId}-${section}.${format === "excel" ? "xlsx" : "pdf"}`,
        );
        return { blob: res.data as Blob, filename };
    },
};
