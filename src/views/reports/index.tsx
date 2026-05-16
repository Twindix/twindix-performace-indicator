import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Lightbulb, Users } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header, ScoreGauge, StatusBadge } from "@/components/shared";
import { MetricStatus } from "@/enums";
import { t, useExportReportSection, usePermissions, useProjectReport, useProjectsListLite } from "@/hooks";
import type { ReportSectionKey, ReportExportFormat } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn } from "@/utils";

const getScoreStatus = (score: number): MetricStatus => {
    if (score >= 80) return MetricStatus.Healthy;
    if (score >= 60) return MetricStatus.Warning;
    return MetricStatus.Critical;
};

const getBarColor = (score: number): string => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-error";
};

interface SectionCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    onExport: (format: ReportExportFormat) => void;
    isExporting: boolean;
    canExport: boolean;
}

const SectionCard = ({ title, description, children, onExport, isExporting, canExport }: SectionCardProps) => (
    <Card className="mb-6">
        <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <CardTitle className="text-lg">{t(title)}</CardTitle>
                    {description && <p className="text-xs text-text-muted mt-1">{t(description)}</p>}
                </div>
                {canExport && (
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onExport("pdf")} disabled={isExporting} className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            {t("PDF")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onExport("excel")} disabled={isExporting} className="gap-1.5">
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
    const { exportHandler, isLoading: isExporting } = useExportReportSection();

    const handleExport = (section: ReportSectionKey) => (format: ReportExportFormat) => {
        if (!selectedProjectId) return;
        exportHandler(selectedProjectId, section, format);
    };

    return (
        <div>
            <Header
                title={t("Reports")}
                description={t("Multi-section project report with export per section")}
                actions={
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder={t("Select project")} />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            {!selectedProjectId ? (
                <EmptyState icon={Users} title={t("No project selected")} description={t("Pick a project to view its report.")} />
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
                                <h2 className="text-xl font-bold text-text-dark">{report.project.name}</h2>
                                <p className="text-xs text-text-muted">{report.team.name}</p>
                            </div>
                            <Badge variant={report.project.status === "active" ? "success" : "secondary"}>{t(report.project.status)}</Badge>
                        </div>
                    </div>

                    <SectionCard title="Overview" description="Project context and attention items" onExport={handleExport("overview")} isExporting={isExporting} canExport={canExport}>
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

                    <SectionCard title="Delivery Progress" description="Completion, on-time rate, blockers" onExport={handleExport("delivery")} isExporting={isExporting} canExport={canExport}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <ScoreGauge score={report.delivery.completion} size="md" label={t("Completion")} />
                            <Stat label={t("Tasks done")} value={`${report.delivery.tasks_done}/${report.delivery.tasks_total}`} />
                            <Stat label={t("On-time")} value={`${report.delivery.on_time_rate}%`} />
                            <Stat label={t("Open blockers")} value={report.delivery.open_blockers} tone={report.delivery.open_blockers > 0 ? "error" : undefined} />
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full", getBarColor(report.delivery.completion))} style={{ width: `${Math.min(report.delivery.completion, 100)}%` }} />
                        </div>
                        <div className="mt-2"><StatusBadge status={getScoreStatus(report.delivery.completion)} /></div>
                    </SectionCard>

                    <SectionCard title="Team Workload" description="Capacity and utilization" onExport={handleExport("workload")} isExporting={isExporting} canExport={canExport}>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <Stat label={t("Team size")} value={report.workload.team_size} />
                            <Stat label={t("Avg utilization")} value={`${report.workload.avg_utilization}%`} />
                            <Stat label={t("Overloaded")} value={report.workload.overloaded} tone={report.workload.overloaded > 0 ? "error" : undefined} />
                            <Stat label={t("Points done")} value={report.workload.points_completed} />
                            <Stat label={t("Points total")} value={report.workload.points_total} />
                        </div>
                    </SectionCard>

                    <SectionCard title="Handoff Quality" description="Phase transition completeness" onExport={handleExport("handoff")} isExporting={isExporting} canExport={canExport}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <Stat label={t("Total handoffs")} value={report.handoff.total_handoffs} />
                            <Stat label={t("Avg completion")} value={`${report.handoff.avg_completion}%`} />
                            <Stat label={t("Fully completed")} value={report.handoff.fully_completed} />
                            <Stat label={t("Below threshold")} value={report.handoff.below_threshold} tone={report.handoff.below_threshold > 0 ? "error" : undefined} />
                        </div>
                    </SectionCard>

                    <SectionCard title="Authorship" description="Features and tasks per contributor" onExport={handleExport("authorship")} isExporting={isExporting} canExport={canExport}>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                            <Stat label={t("Total items")} value={report.authorship.total_items} />
                            <Stat label={t("Features")} value={report.authorship.features} />
                            <Stat label={t("Tasks")} value={report.authorship.tasks} />
                        </div>
                        {report.authorship.contributors.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {report.authorship.contributors.map((c, i) => (
                                    <div key={c.user_id ?? `c-${i}`} className="flex items-center justify-between gap-2 text-xs">
                                        <span className="font-semibold text-text-dark">{c.name}</span>
                                        <span className="text-text-muted">{c.features} {t("features")} · {c.tasks} {t("tasks")} · <strong className="text-text-dark"><AnimatedNumber value={c.total} /></strong></span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="Friction Points" description="Blocker categories and resolution" onExport={handleExport("friction")} isExporting={isExporting} canExport={canExport}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                                <Stat label={t("Avg resolution (hours)")} value={report.friction.avg_resolution_hours} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {report.friction.categories.map((cat) => (
                                    <div key={cat.category} className="flex items-center justify-between text-xs">
                                        <span className="text-text-secondary">{cat.category}</span>
                                        <span className="font-semibold text-text-dark"><AnimatedNumber value={cat.count} /></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Recommendations" description="What to focus on next" onExport={handleExport("recommendations")} isExporting={isExporting} canExport={canExport}>
                        <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
                            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-warning-light text-warning shrink-0">
                                <Lightbulb className="h-4 w-4" />
                            </div>
                            <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                                {report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
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
        <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className={cn("text-base font-bold", tone === "error" ? "text-error" : "text-text-dark")}>{value}</p>
    </div>
);
