import { useMemo, useState } from "react";
import { ArrowRight, Download, FileSpreadsheet, Lightbulb, Users } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header, ScoreGauge, StatusBadge } from "@/components/shared";
import { analyticsSeed, authorshipSeed, handoffsSeed, timeSeed } from "@/data";

interface WorkloadStub { memberId: string; sprintId: string; assignedPoints: number; completedPoints: number; capacity: number; contextSwitches: number; activeTaskCount: number; }
const workloadSeed: WorkloadStub[] = [];
import { MetricStatus } from "@/enums";
import { t } from "@/hooks";
import type { BreakdownSliceInterface } from "@/interfaces";
import { cn, formatDate } from "@/utils";

import { downloadSectionAsExcel, downloadSectionAsPdf, type ReportSection } from "./report-export";

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

const SectionCard = ({
    title,
    description,
    children,
    onDownloadPdf,
    onDownloadExcel,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    onDownloadPdf: () => void;
    onDownloadExcel: () => void;
}) => (
    <Card className="mb-6">
        <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <CardTitle className="text-lg">{t(title)}</CardTitle>
                    {description && <p className="text-xs text-text-muted mt-1">{t(description)}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={onDownloadPdf} className="gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        {t("PDF")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={onDownloadExcel} className="gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        {t("Excel")}
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

export const ReportsView = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>(timeSeed.projects[0]?.id ?? "");

    const project = timeSeed.projects.find((p) => p.id === selectedProjectId);
    const projectSprints = timeSeed.sprints.filter((s) => s.project_id === selectedProjectId);
    const sprintIds = new Set(projectSprints.map((s) => s.id));
    const projectWorkload = workloadSeed.filter((w) => sprintIds.has(w.sprintId));
    const projectHandoffs = handoffsSeed.filter((h) => sprintIds.has(h.sprintId));
    const projectAuthorship = authorshipSeed.filter((a) => a.project_id === selectedProjectId);
    const analytics = analyticsSeed.projects[selectedProjectId] ?? analyticsSeed.fallback.project;

    const projectName = project?.name ?? "—";

    const workloadMetrics = useMemo(() => {
        const memberIds = new Set(projectWorkload.map((w) => w.memberId));
        const assigned = projectWorkload.reduce((acc, w) => acc + w.assignedPoints, 0);
        const completed = projectWorkload.reduce((acc, w) => acc + w.completedPoints, 0);
        const capacity = projectWorkload.reduce((acc, w) => acc + w.capacity, 0);
        const avgUtil = projectWorkload.length > 0
            ? Math.round(projectWorkload.reduce((acc, w) => acc + (w.assignedPoints / Math.max(w.capacity, 1)) * 100, 0) / projectWorkload.length)
            : 0;
        const overloaded = projectWorkload.filter((w) => w.assignedPoints > w.capacity).length;
        return { teamSize: memberIds.size, assigned, completed, capacity, avgUtil, overloaded };
    }, [projectWorkload]);

    const handoffStats = useMemo(() => {
        const total = projectHandoffs.length;
        const avg = total > 0 ? Math.round(projectHandoffs.reduce((s, h) => s + h.completionRate, 0) / total) : 0;
        const full = projectHandoffs.filter((h) => h.completionRate >= 100).length;
        const below = projectHandoffs.filter((h) => h.completionRate < 80).length;
        return { total, avg, full, below };
    }, [projectHandoffs]);

    const recommendations = useMemo(() => {
        const recs: string[] = [];
        if (analytics.completion_rate < 50) recs.push("Project completion is below 50%. Cut scope or break large stories into smaller deliverables.");
        if (analytics.open_blockers >= 3) recs.push("Multiple open blockers are compounding delivery risk. Run a focused blocker-busting session this week.");
        if (analytics.on_time_rate < 70) recs.push("On-time rate has slipped. Review the last three sprints to identify repeat causes of slippage.");
        if (workloadMetrics.overloaded > 0) recs.push("Some team members are over capacity. Rebalance commitments before planning the next sprint.");
        if (handoffStats.below > 0) recs.push("Handoffs are landing below the 80% completion threshold. Tighten definition-of-done checklists at phase transitions.");
        if (recs.length === 0) recs.push("Project is tracking well across delivery, capacity, and handoff signals. Keep investing in the current cadence.");
        return recs;
    }, [analytics, workloadMetrics, handoffStats]);

    // Section builders (narrative + tabular + summary data for downloads)
    const overviewSection = (): ReportSection => ({
        title: "Overview",
        subtitle: project ? `${project.team_name}` : "",
        narrative: [
            project
                ? `This overview covers ${project.name} (${project.status}) delivered by ${project.team_name}. The project spans ${projectSprints.length} sprint${projectSprints.length === 1 ? "" : "s"} with an overall progress of ${project.progress}%.`
                : "No project selected.",
            `At the time of export, the project has ${projectAuthorship.length} authored item${projectAuthorship.length === 1 ? "" : "s"} (${projectAuthorship.filter((a) => a.kind === "feature").length} features and ${projectAuthorship.filter((a) => a.kind === "task").length} tasks) contributed by ${new Set(projectAuthorship.map((a) => a.creator_id)).size} people.`,
            `Delivery signals combine completion (${analytics.completion_rate}%), on-time rate (${analytics.on_time_rate}%), and ${analytics.open_blockers} open blocker${analytics.open_blockers === 1 ? "" : "s"}.`,
        ],
        tableHeaders: ["Sprint", "Start", "End", "Status"],
        tableRows: projectSprints.map((s) => [s.name, formatDate(s.start_date), formatDate(s.end_date), s.status]),
        summary: [
            { label: "Sprints", value: projectSprints.length },
            { label: "Completion", value: `${analytics.completion_rate}%` },
            { label: "On-time Rate", value: `${analytics.on_time_rate}%` },
            { label: "Open Blockers", value: analytics.open_blockers },
        ],
    });

    const deliverySection = (): ReportSection => ({
        title: "Delivery Progress",
        subtitle: projectName,
        narrative: [
            `Velocity has moved through ${analytics.velocity_trend.length} sprints, ranging from ${Math.min(...analytics.velocity_trend.map((p) => p.value))} to ${Math.max(...analytics.velocity_trend.map((p) => p.value))} story points.`,
            `Tasks delivered stand at ${analytics.tasks_done} of ${analytics.tasks_total} (${Math.round((analytics.tasks_done / Math.max(analytics.tasks_total, 1)) * 100)}%).`,
            `Active sprints in this project: ${analytics.sprints_active}. Total sprints scoped: ${analytics.sprints_total}.`,
        ],
        tableHeaders: ["Sprint", "Velocity"],
        tableRows: analytics.velocity_trend.map((p) => [p.label, p.value]),
        summary: [
            { label: "Completion", value: `${analytics.completion_rate}%` },
            { label: "Tasks Done", value: `${analytics.tasks_done} / ${analytics.tasks_total}` },
            { label: "Sprints Active", value: analytics.sprints_active },
            { label: "Open Blockers", value: analytics.open_blockers },
        ],
    });

    const workloadSection = (): ReportSection => ({
        title: "Team Workload",
        subtitle: projectName,
        narrative: [
            `The project currently engages ${workloadMetrics.teamSize} contributor${workloadMetrics.teamSize === 1 ? "" : "s"} across its sprints.`,
            `Average utilization across assignments is ${workloadMetrics.avgUtil}% of capacity, with ${workloadMetrics.overloaded} member${workloadMetrics.overloaded === 1 ? "" : "s"} currently above 100%.`,
            `Of ${workloadMetrics.assigned} assigned points, ${workloadMetrics.completed} have been completed against a total capacity of ${workloadMetrics.capacity} points.`,
        ],
        tableHeaders: ["Member", "Sprint", "Assigned", "Completed", "Capacity", "Utilization"],
        tableRows: projectWorkload.map((w) => {
            const m = timeSeed.members.find((mm) => mm.id === w.memberId);
            const s = projectSprints.find((ss) => ss.id === w.sprintId);
            const util = Math.round((w.assignedPoints / Math.max(w.capacity, 1)) * 100);
            return [m?.full_name ?? w.memberId, s?.name ?? w.sprintId, w.assignedPoints, w.completedPoints, w.capacity, `${util}%`];
        }),
        summary: [
            { label: "Team Size", value: workloadMetrics.teamSize },
            { label: "Avg Utilization", value: `${workloadMetrics.avgUtil}%` },
            { label: "Overloaded", value: workloadMetrics.overloaded },
            { label: "Completed Points", value: workloadMetrics.completed },
        ],
    });

    const handoffSection = (): ReportSection => ({
        title: "Handoff Quality",
        subtitle: projectName,
        narrative: [
            handoffStats.total === 0
                ? "No handoffs have been recorded for this project yet."
                : `Across ${handoffStats.total} tracked handoff${handoffStats.total === 1 ? "" : "s"}, the average completion rate is ${handoffStats.avg}%.`,
            handoffStats.full > 0
                ? `${handoffStats.full} handoff${handoffStats.full === 1 ? " has" : "s have"} hit 100%, indicating clean phase transitions on those stories.`
                : "No handoff has reached 100% completion yet.",
            handoffStats.below > 0
                ? `${handoffStats.below} handoff${handoffStats.below === 1 ? " is" : "s are"} below the 80% threshold — tighten definition-of-done at those phase boundaries.`
                : "All handoffs are meeting the 80% completion threshold.",
        ],
        tableHeaders: ["From", "To", "Task", "Sprint", "Completion"],
        tableRows: projectHandoffs.map((h) => {
            const s = projectSprints.find((ss) => ss.id === h.sprintId);
            return [h.fromPhase, h.toPhase, h.taskId, s?.name ?? h.sprintId, `${h.completionRate}%`];
        }),
        summary: [
            { label: "Total", value: handoffStats.total },
            { label: "Avg Completion", value: `${handoffStats.avg}%` },
            { label: "Fully Completed", value: handoffStats.full },
            { label: "Below Threshold", value: handoffStats.below },
        ],
    });

    const authorshipSection = (): ReportSection => ({
        title: "Authorship",
        subtitle: projectName,
        narrative: [
            projectAuthorship.length === 0
                ? "No authored features or tasks are recorded for this project."
                : `${projectAuthorship.length} item${projectAuthorship.length === 1 ? "" : "s"} have been authored — ${projectAuthorship.filter((a) => a.kind === "feature").length} features and ${projectAuthorship.filter((a) => a.kind === "task").length} tasks.`,
            `Contributions come from ${new Set(projectAuthorship.map((a) => a.creator_id)).size} distinct author${new Set(projectAuthorship.map((a) => a.creator_id)).size === 1 ? "" : "s"}. Use the Ownership page to drill into any individual's feed.`,
        ],
        tableHeaders: ["Type", "Name", "Creator", "Status", "Updated"],
        tableRows: projectAuthorship.map((a) => {
            const creator = timeSeed.members.find((m) => m.id === a.creator_id);
            return [a.kind, a.name, creator?.full_name ?? a.creator_id, a.status, formatDate(a.updated_at)];
        }),
        summary: [
            { label: "Items", value: projectAuthorship.length },
            { label: "Features", value: projectAuthorship.filter((a) => a.kind === "feature").length },
            { label: "Tasks", value: projectAuthorship.filter((a) => a.kind === "task").length },
            { label: "Contributors", value: new Set(projectAuthorship.map((a) => a.creator_id)).size },
        ],
    });

    const frictionSection = (): ReportSection => ({
        title: "Friction Sources",
        subtitle: projectName,
        narrative: [
            `Blocker sources are classified into six areas. Totals reflect where friction is currently concentrated across this project.`,
            `The largest source this period is ${[...analytics.blocker_breakdown].sort((a, b) => b.value - a.value)[0]?.name ?? "n/a"} with ${[...analytics.blocker_breakdown].sort((a, b) => b.value - a.value)[0]?.value ?? 0} issues. Targeting the top one or two sources typically reduces overall friction the fastest.`,
        ],
        tableHeaders: ["Source", "Count"],
        tableRows: analytics.blocker_breakdown.map((b: BreakdownSliceInterface) => [b.name, b.value]),
        summary: analytics.blocker_breakdown.map((b: BreakdownSliceInterface) => ({ label: b.name, value: b.value })),
    });

    const recommendationsSection = (): ReportSection => ({
        title: "Recommendations",
        subtitle: projectName,
        narrative: [
            "Recommendations are generated from completion rate, blocker count, on-time rate, workload utilization, and handoff quality.",
            "Treat each item as a testable hypothesis for the next planning cycle — review the outcome at the next retrospective.",
        ],
        tableHeaders: ["#", "Recommendation"],
        tableRows: recommendations.map((r, i) => [i + 1, r]),
    });

    const handleDownload = (format: "pdf" | "excel", builder: () => ReportSection) => {
        const section = builder();
        if (format === "pdf") downloadSectionAsPdf(section, projectName);
        else downloadSectionAsExcel(section, projectName);
    };

    if (!project) {
        return (
            <div>
                <Header title={t("Reports")} description={t("Downloadable analytics per project")} />
                <Card><CardContent className="p-6 text-center text-text-muted">{t("No projects available to report on.")}</CardContent></Card>
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Reports")} description={t("Downloadable analytics per project. Every section exports to PDF or Excel.")} />

            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-text-muted">{t("Project")}</p>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="mt-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm font-semibold"
                        >
                            {timeSeed.projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-text-muted mt-2">{project.team_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md border border-border px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-text-muted">{t("Status")}</p>
                            <Badge variant={project.status === "active" ? "success" : project.status === "planning" ? "warning" : "secondary"}>
                                {t(project.status)}
                            </Badge>
                        </div>
                        <div className="rounded-md border border-border px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-text-muted">{t("Progress")}</p>
                            <p className="text-sm font-semibold text-text-dark">{project.progress}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overview */}
            <SectionCard
                title="Overview"
                description="Project charter, team, and sprint roster."
                onDownloadPdf={() => handleDownload("pdf", overviewSection)}
                onDownloadExcel={() => handleDownload("excel", overviewSection)}
            >
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center">
                    <ScoreGauge score={analytics.completion_rate} size="md" label={t("Completion")} />
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {t("Overall project progress rolled up from delivered tasks, story points, and active sprints.")}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <InfoTile label={t("Sprints")} value={projectSprints.length} />
                            <InfoTile label={t("Tasks")} value={`${analytics.tasks_done} / ${analytics.tasks_total}`} />
                            <InfoTile label={t("On-time")} value={`${analytics.on_time_rate}%`} />
                            <InfoTile label={t("Team")} value={project.team_name} />
                        </div>
                        <StatusBadge status={getScoreStatus(analytics.completion_rate)} />
                    </div>
                </div>
            </SectionCard>

            {/* Delivery Progress */}
            <SectionCard
                title="Delivery Progress"
                description="Completion, on-time rate, and velocity across the project's sprints."
                onDownloadPdf={() => handleDownload("pdf", deliverySection)}
                onDownloadExcel={() => handleDownload("excel", deliverySection)}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    <Stat label={t("Completion")} value={<AnimatedNumber value={analytics.completion_rate} suffix="%" />} tone={analytics.completion_rate >= 70 ? "success" : analytics.completion_rate >= 40 ? "warning" : "error"} />
                    <Stat label={t("Tasks Done")} value={`${analytics.tasks_done} / ${analytics.tasks_total}`} tone="default" />
                    <Stat label={t("On-time Rate")} value={<AnimatedNumber value={analytics.on_time_rate} suffix="%" />} tone="success" />
                    <Stat label={t("Open Blockers")} value={<AnimatedNumber value={analytics.open_blockers} />} tone={analytics.open_blockers > 0 ? "error" : "success"} />
                </div>
                <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", getBarColor(analytics.completion_rate))} style={{ width: `${analytics.completion_rate}%` }} />
                </div>
            </SectionCard>

            {/* Workload */}
            <SectionCard
                title="Team Workload"
                description="Capacity and utilization across everyone contributing to this project."
                onDownloadPdf={() => handleDownload("pdf", workloadSection)}
                onDownloadExcel={() => handleDownload("excel", workloadSection)}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Stat label={t("Team Size")} value={<AnimatedNumber value={workloadMetrics.teamSize} />} icon={Users} tone="default" />
                    <Stat label={t("Avg Utilization")} value={<AnimatedNumber value={workloadMetrics.avgUtil} suffix="%" />} tone={workloadMetrics.avgUtil > 100 ? "error" : workloadMetrics.avgUtil >= 85 ? "warning" : "success"} />
                    <Stat label={t("Overloaded")} value={<AnimatedNumber value={workloadMetrics.overloaded} />} tone={workloadMetrics.overloaded > 0 ? "error" : "success"} />
                    <Stat label={t("Points")} value={`${workloadMetrics.completed} / ${workloadMetrics.assigned}`} tone="default" />
                </div>
            </SectionCard>

            {/* Handoff Quality */}
            <SectionCard
                title="Handoff Quality"
                description="Phase transitions scored against entry and exit criteria."
                onDownloadPdf={() => handleDownload("pdf", handoffSection)}
                onDownloadExcel={() => handleDownload("excel", handoffSection)}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Stat label={t("Total Handoffs")} value={<AnimatedNumber value={handoffStats.total} />} tone="default" />
                    <Stat label={t("Avg Completion")} value={<AnimatedNumber value={handoffStats.avg} suffix="%" />} tone="default" />
                    <Stat label={t("Fully Completed")} value={<AnimatedNumber value={handoffStats.full} />} tone="success" />
                    <Stat label={t("Below Threshold")} value={<AnimatedNumber value={handoffStats.below} />} tone={handoffStats.below > 0 ? "error" : "success"} />
                </div>
            </SectionCard>

            {/* Authorship */}
            <SectionCard
                title="Authorship"
                description="Who authored each feature and task inside the project."
                onDownloadPdf={() => handleDownload("pdf", authorshipSection)}
                onDownloadExcel={() => handleDownload("excel", authorshipSection)}
            >
                {projectAuthorship.length === 0 ? (
                    <p className="text-sm text-text-muted">{t("No authored items recorded for this project yet.")}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-text-muted border-b border-border">
                                    <th className="py-2 pr-3">{t("Name")}</th>
                                    <th className="py-2 pr-3">{t("Type")}</th>
                                    <th className="py-2 pr-3">{t("Creator")}</th>
                                    <th className="py-2 pr-3">{t("Status")}</th>
                                    <th className="py-2 pr-3">{t("Updated")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {projectAuthorship.map((a) => {
                                    const creator = timeSeed.members.find((m) => m.id === a.creator_id);
                                    return (
                                        <tr key={a.id}>
                                            <td className="py-2 pr-3 font-medium text-text-dark">{a.name}</td>
                                            <td className="py-2 pr-3 text-text-muted">{t(a.kind)}</td>
                                            <td className="py-2 pr-3 text-text-muted">{creator?.full_name ?? a.creator_id}</td>
                                            <td className="py-2 pr-3">
                                                <Badge variant={a.status === "shipped" ? "success" : a.status === "active" ? "default" : a.status === "draft" ? "warning" : "secondary"}>{t(a.status)}</Badge>
                                            </td>
                                            <td className="py-2 pr-3 text-text-muted">{formatDate(a.updated_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Friction Sources */}
            <SectionCard
                title="Friction Sources"
                description="Where blockers and drag are coming from."
                onDownloadPdf={() => handleDownload("pdf", frictionSection)}
                onDownloadExcel={() => handleDownload("excel", frictionSection)}
            >
                <div className="flex flex-col gap-3">
                    {analytics.blocker_breakdown.map((area) => {
                        const max = Math.max(...analytics.blocker_breakdown.map((b) => b.value), 1);
                        const width = Math.round((area.value / max) * 100);
                        return (
                            <div key={area.name}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-text-dark">{area.name}</span>
                                    <span className="text-text-muted">{area.value} {t("issues")}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${width}%`, background: area.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Recommendations */}
            <SectionCard
                title="Recommendations"
                description="Actions informed by completion, blockers, workload, and handoff signals."
                onDownloadPdf={() => handleDownload("pdf", recommendationsSection)}
                onDownloadExcel={() => handleDownload("excel", recommendationsSection)}
            >
                <div className="flex items-start gap-3 mb-3">
                    <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary">
                        {t("Treat each recommendation as a testable hypothesis for the next planning cycle.")}
                    </p>
                </div>
                <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-sm text-text-secondary leading-relaxed">{rec}</p>
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </div>
    );
};

const Stat = ({ label, value, tone = "default", icon: Icon }: {
    label: string;
    value: React.ReactNode;
    tone?: "default" | "success" | "warning" | "error";
    icon?: typeof Users;
}) => {
    const toneClass = {
        default: "text-text-dark",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
    }[tone];
    return (
        <div className="text-center rounded-md bg-muted/30 px-3 py-3">
            {Icon && <Icon className="h-4 w-4 text-text-muted mx-auto mb-1" />}
            <p className={cn("text-xl sm:text-2xl font-bold", toneClass)}>{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
        </div>
    );
};

const InfoTile = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-md bg-muted/40 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className="text-sm font-bold text-text-dark">{value}</p>
    </div>
);

