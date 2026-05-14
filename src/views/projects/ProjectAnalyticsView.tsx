import { ArrowLeft, CheckCircle2, Clock, Target, TriangleAlert } from "lucide-react";

import { Badge, Button } from "@/atoms";
import {
    AreaTrend,
    BurnChart,
    ChartCard,
    DonutBreakdown,
    RadialProgress,
} from "@/components/shared";
import { analyticsSeed } from "@/data/seed";
import { t } from "@/hooks";
import type { ProjectInterface } from "@/interfaces";

interface ProjectAnalyticsViewProps {
    project: ProjectInterface;
    onBack: () => void;
    onViewSprints: () => void;
}

const STATUS_LABEL: Record<ProjectInterface["status"], string> = {
    active: "Active",
    planning: "Planning",
    on_hold: "On Hold",
    completed: "Completed",
};

const STATUS_VARIANT: Record<ProjectInterface["status"], "default" | "success" | "warning" | "secondary"> = {
    active: "success",
    planning: "default",
    on_hold: "warning",
    completed: "secondary",
};

const MiniStat = ({ icon: Icon, label, value, tone = "primary" }: {
    icon: typeof Target;
    label: string;
    value: string | number;
    tone?: "primary" | "success" | "warning" | "error";
}) => {
    const toneClass = {
        primary: "text-primary-medium bg-primary-lighter",
        success: "text-success bg-success-light",
        warning: "text-warning bg-warning-light",
        error: "text-error bg-error-light",
    }[tone];
    return (
        <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-md flex items-center justify-center ${toneClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
                <p className="text-base font-bold text-text-dark">{value}</p>
            </div>
        </div>
    );
};

export const ProjectAnalyticsView = ({ project, onBack, onViewSprints }: ProjectAnalyticsViewProps) => {
    const analytics = analyticsSeed.projects[project.id] ?? analyticsSeed.fallback.project;

    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    {t("Back to Projects")}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
                {/* LEFT — project details */}
                <aside className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-text-dark">{project.name}</h2>
                            <Badge variant={STATUS_VARIANT[project.status]}>{t(STATUS_LABEL[project.status])}</Badge>
                        </div>
                        {project.description && (
                            <p className="text-sm text-text-secondary mb-4">{project.description}</p>
                        )}

                        <dl className="space-y-2 text-xs">
                            <DetailRow label={t("Start")} value={project.start_date ?? "—"} />
                            <DetailRow label={t("End")} value={project.end_date ?? "—"} />
                            <DetailRow label={t("Sprints")} value={analytics.sprints_total} />
                            <DetailRow label={t("Active Sprints")} value={analytics.sprints_active} />
                            <DetailRow label={t("Tasks")} value={`${analytics.tasks_done} / ${analytics.tasks_total}`} />
                            <DetailRow label={t("Open Blockers")} value={analytics.open_blockers} tone={analytics.open_blockers > 0 ? "error" : undefined} />
                        </dl>

                        <Button className="w-full mt-4" size="sm" variant="outline" onClick={onViewSprints}>
                            {t("View Sprints")}
                        </Button>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-text-dark mb-2">{t("Top Contributors")}</h3>
                        <div className="space-y-3">
                            {analytics.contributors.map((person) => (
                                <div key={person.name} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary-lighter text-primary-medium text-xs font-semibold flex items-center justify-center">
                                        {person.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-dark truncate">{person.name}</p>
                                        <p className="text-[11px] text-text-muted">
                                            {person.tasks_done} {t("tasks")} · {person.hours}h
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* CENTER — charts */}
                <section className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <MiniStat icon={Target} label={t("Completion")} value={`${analytics.completion_rate}%`} tone="primary" />
                        <MiniStat icon={CheckCircle2} label={t("On-time Rate")} value={`${analytics.on_time_rate}%`} tone="success" />
                        <MiniStat icon={Clock} label={t("Active Sprints")} value={analytics.sprints_active} tone="primary" />
                        <MiniStat icon={TriangleAlert} label={t("Open Blockers")} value={analytics.open_blockers} tone={analytics.open_blockers > 0 ? "error" : "success"} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <ChartCard title={t("Velocity Over Sprints")} subtitle={t("Story points completed per sprint")} height={240}>
                                <AreaTrend data={analytics.velocity_trend} valueLabel={t("Velocity")} />
                            </ChartCard>
                        </div>
                        <ChartCard title={t("Completion")} subtitle={t("Project progress")} height={240}>
                            <div className="relative h-full">
                                <RadialProgress value={analytics.completion_rate} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-text-dark">{analytics.completion_rate}%</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wide">{t("complete")}</p>
                                    </div>
                                </div>
                            </div>
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title={t("Burn Chart")} subtitle={t("Planned vs actual remaining")} height={240}>
                            <BurnChart data={analytics.burn_chart} />
                        </ChartCard>
                        <ChartCard title={t("Task Status")} subtitle={t("Current breakdown")} height={240}>
                            <DonutBreakdown data={analytics.status_breakdown} unit={t("tasks")} />
                        </ChartCard>
                    </div>

                    <ChartCard title={t("Blocker Sources")} subtitle={t("Where friction is coming from")} height={220}>
                        <DonutBreakdown data={analytics.blocker_breakdown} unit={t("issues")} />
                    </ChartCard>
                </section>
            </div>
        </div>
    );
};

interface DetailRowProps {
    label: string;
    value: string | number;
    tone?: "error";
}

const DetailRow = ({ label, value, tone }: DetailRowProps) => (
    <div className="flex items-center justify-between gap-2">
        <dt className="text-text-muted">{label}</dt>
        <dd className={`font-semibold ${tone === "error" ? "text-error" : "text-text-dark"}`}>{value}</dd>
    </div>
);
