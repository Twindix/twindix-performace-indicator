import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Users } from "lucide-react";

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/atoms";

import {
    EmptyState,
    Header,
} from "@/components/shared";

import {
    t,
    useExportReportSection,
    useMeetingsList,
    usePermissions,
    useProjectReport,
    useProjectsListLite,
} from "@/hooks";

import type {
    ReportExportFormat,
    ReportSectionKey,
} from "@/interfaces";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui";

import { cn } from "@/utils";

interface SectionCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    onExport: (format: ReportExportFormat) => void;
    isExporting: boolean;
    canExport: boolean;
}

const SectionCard = ({
    title,
    description,
    children,
    onExport,
    isExporting,
    canExport,
}: SectionCardProps) => (
    <Card className="mb-6">
        <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <CardTitle className="text-lg">{t(title)}</CardTitle>
                    {description && (
                        <p className="text-xs text-text-muted mt-1">
                            {t(description)}
                        </p>
                    )}
                </div>

                {canExport && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExport("pdf")}
                            disabled={isExporting}
                            className="gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" />
                            {t("PDF")}
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExport("excel")}
                            disabled={isExporting}
                            className="gap-1.5"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            {t("Excel")}
                        </Button>
                    </div>
                )}
            </div>
        </CardHeader>

        <CardContent>{children}</CardContent>
    </Card>
);

export const ReportsView = () => {
    const p = usePermissions();
    const canExport = p.reports.export();

    const { projects } = useProjectsListLite();

    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const { report, isLoading } = useProjectReport(selectedProjectId);
    const { items: meetings } = useMeetingsList(selectedProjectId);

    const { exportHandler, isLoading: isExporting } =
        useExportReportSection();

    const handleExport =
        (section: ReportSectionKey) =>
        (format: ReportExportFormat) => {
            if (!selectedProjectId) return;

            exportHandler(selectedProjectId, section, format);
        };

    return (
        <div>
            <Header
                title={t("Reports")}
                description={t(
                    "Multi-section project report with export per section"
                )}
                actions={
                    <Select
                        value={selectedProjectId}
                        onValueChange={setSelectedProjectId}
                    >
                        <SelectTrigger className="w-[240px]">
                            <SelectValue
                                placeholder={t("Select project")}
                            />
                        </SelectTrigger>

                        <SelectContent>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            {!selectedProjectId ? (
                <EmptyState
                    icon={Users}
                    title={t("No project selected")}
                    description={t(
                        "Pick a project to view its report."
                    )}
                />
            ) : isLoading && !report ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading report...")}
                </div>
            ) : !report ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("No report available for this project.")}
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border bg-card p-5 mb-6">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-bold text-text-dark">
                                    {report.project.name}
                                </h2>

                                <p className="text-xs text-text-muted">
                                    {report.team.name}
                                </p>
                            </div>

                            <Badge
                                variant={
                                    report.project.status === "active"
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {t(report.project.status)}
                            </Badge>
                        </div>
                    </div>

                    <SectionCard
                        title="Overview"
                        description="Project context and attention items"
                        onExport={handleExport("overview")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <Stat label={t("Sprints")} value={report.overview.sprints_count} />
                            <Stat label={t("Tasks")} value={`${report.overview.tasks_done}/${report.overview.tasks_total}`} />
                            <Stat label={t("On-time Rate")} value={`${report.overview.on_time_rate}%`} />
                            <Stat label={t("Team")} value={report.overview.team_name} />
                        </div>
                        {report.overview.needs_attention.length > 0 && (
                            <div className="rounded-md bg-warning-light/40 border border-warning/30 px-3 py-2">
                                <p className="text-xs font-semibold text-warning mb-1">{t("Needs attention")}</p>
                                <ul className="list-disc list-inside text-xs text-text-secondary space-y-0.5">
                                    {report.overview.needs_attention.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Delivery"
                        description="Completion rate, on-time delivery, and blockers"
                        onExport={handleExport("delivery")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <Stat label={t("Completion")} value={`${report.delivery.completion}%`} />
                            <Stat label={t("Tasks Done")} value={`${report.delivery.tasks_done}/${report.delivery.tasks_total}`} />
                            <Stat label={t("On-time Rate")} value={`${report.delivery.on_time_rate}%`} />
                            <Stat label={t("Open Blockers")} value={report.delivery.open_blockers} tone={report.delivery.open_blockers > 0 ? "error" : undefined} />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Workload"
                        description="Team capacity and story point utilisation"
                        onExport={handleExport("workload")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <Stat label={t("Team Size")} value={report.workload.team_size} />
                            <Stat label={t("Avg Utilisation")} value={`${report.workload.avg_utilization}%`} />
                            <Stat label={t("Overloaded Members")} value={report.workload.overloaded} tone={report.workload.overloaded > 0 ? "error" : undefined} />
                            <Stat label={t("Story Points")} value={`${report.workload.points_completed}/${report.workload.points_total}`} />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Handoffs"
                        description="Phase transition criteria completion across sprints"
                        onExport={handleExport("handoff")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <Stat label={t("Total Handoffs")} value={report.handoff.total_handoffs} />
                            <Stat label={t("Avg Completion")} value={`${report.handoff.avg_completion}%`} />
                            <Stat label={t("Fully Completed")} value={report.handoff.fully_completed} />
                            <Stat label={t("Below Threshold")} value={report.handoff.below_threshold} tone={report.handoff.below_threshold > 0 ? "error" : undefined} />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Ownership"
                        description="Feature and task authorship by team member"
                        onExport={handleExport("authorship")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <Stat label={t("Total Items")} value={report.authorship.total_items} />
                            <Stat label={t("Features")} value={report.authorship.features} />
                            <Stat label={t("Tasks")} value={report.authorship.tasks} />
                        </div>
                        {report.authorship.contributors.length > 0 && (
                            <div className="space-y-2">
                                {report.authorship.contributors.map((c, i) => (
                                    <div key={c.user_id ?? i} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                                        <span className="font-medium text-text-dark">{c.name}</span>
                                        <span className="text-xs text-text-muted">{c.features} {t("features")} · {c.tasks} {t("tasks")} · {c.total} {t("total")}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Meetings"
                        description="Meeting log for this project"
                        onExport={() => {}}
                        isExporting={false}
                        canExport={false}
                    >
                        {meetings.length === 0 ? (
                            <p className="text-sm text-text-muted">{t("No meetings found for this project.")}</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                    <Stat label={t("Total")} value={meetings.length} />
                                    <Stat label={t("Scheduled")} value={meetings.filter((m) => m.status === "scheduled").length} />
                                    <Stat label={t("Voting")} value={meetings.filter((m) => m.status === "voting").length} />
                                    <Stat label={t("Cancelled")} value={meetings.filter((m) => m.status === "cancelled").length} />
                                </div>
                                {meetings.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                            <p className="font-medium text-text-dark truncate">{m.title}</p>
                                            <p className="text-xs text-text-muted">{m.meeting_type} · {m.organizer.name}</p>
                                        </div>
                                        <span className={`text-xs font-semibold shrink-0 ms-3 ${m.status === "scheduled" ? "text-success" : m.status === "cancelled" ? "text-error" : "text-text-muted"}`}>
                                            {m.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Friction"
                        description="Blocker categories and average resolution time"
                        onExport={handleExport("friction")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="mb-4">
                            <Stat label={t("Avg Resolution Time")} value={`${report.friction.avg_resolution_hours}h`} />
                        </div>
                        {report.friction.categories.length > 0 && (
                            <div className="space-y-2">
                                {report.friction.categories.map((cat) => (
                                    <div key={cat.category} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                                        <span className="font-medium text-text-dark">{cat.category}</span>
                                        <span className="text-xs font-bold text-error">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                </>
            )}
        </div>
    );
};

interface StatProps {
    label: string;
    value: string | number;
    tone?: "error";
}

const Stat = ({ label, value, tone }: StatProps) => (
    <div className="rounded-md bg-muted/40 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wide text-text-muted">
            {label}
        </p>

        <p
            className={cn(
                "text-base font-bold",
                tone === "error"
                    ? "text-error"
                    : "text-text-dark"
            )}
        >
            {value}
        </p>
    </div>
);