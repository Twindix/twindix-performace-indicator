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

export const reportsService = {
    fullHandler: async (projectId: string): Promise<ProjectReportResponseInterface> => {
        const { data } = await apiClient.get(apisData.reports.full(projectId));
        return unwrap<ProjectReportResponseInterface>(data);
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
