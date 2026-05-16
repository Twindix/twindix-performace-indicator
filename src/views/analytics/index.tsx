import { useMemo } from "react";
import { CheckCircle2, Clock, Target, TriangleAlert } from "lucide-react";

import { EmptyState, Header } from "@/components/shared";
import {
    BarSeries,
    BurnChart,
    ChartCard,
    DonutBreakdown,
    RadialProgress,
} from "@/components/shared";
import { t, useSprintAnalytics, useSprintsList } from "@/hooks";
import { useSprintStore } from "@/store";

const STATUS_COLOR_MAP: Record<string, string> = {
    in_progress: "var(--color-primary-medium)",
    review: "var(--color-info)",
    blocked: "var(--color-error)",
    done: "var(--color-success)",
    backlog: "var(--color-muted-foreground)",
};

const STATUS_LABEL_MAP: Record<string, string> = {
    in_progress: "In Progress",
    review: "Review",
    blocked: "Blocked",
    done: "Done",
    backlog: "Backlog",
};

const initialsFor = (name: string) =>
    name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

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

export const AnalyticsView = () => {
    const { activeSprintId } = useSprintStore();
    const { sprints } = useSprintsList();
    const { analytics, isLoading } = useSprintAnalytics(activeSprintId ?? "");

    const view = useMemo(() => {
        if (!analytics) return null;
        const burnLength = Math.max(analytics.burn_chart.planned.length, analytics.burn_chart.actual.length);
        return {
            sprint: analytics.sprint,
            stats: analytics.stats,
            contributors: analytics.contributors,
            burn: Array.from({ length: burnLength }).map((_, i) => ({
                label: `D${i + 1}`,
                planned: analytics.burn_chart.planned[i] ?? 0,
                actual: analytics.burn_chart.actual[i] ?? 0,
            })),
            dailyThroughput: analytics.daily_throughput.map((d) => ({
                label: d.day,
                value: d.tasks_completed,
            })),
            taskStatus: Object.entries(analytics.task_status)
                .filter(([, v]) => typeof v === "number" && v > 0)
                .map(([k, v]) => ({
                    name: STATUS_LABEL_MAP[k] ?? k,
                    value: Number(v),
                    color: STATUS_COLOR_MAP[k] ?? "var(--color-muted-foreground)",
                })),
        };
    }, [analytics]);

    if (!activeSprintId) {
        return (
            <div>
                <Header title={t("Sprint Analytics")} description={t("Performance metrics for the active sprint")} />
                <EmptyState
                    icon={Target}
                    title={t("No active sprint")}
                    description={sprints.length > 0 ? t("Pick a sprint from the sprints page to see analytics.") : t("Create and activate a sprint to see analytics.")}
                />
            </div>
        );
    }

    return (
        <div>
            <Header
                title={t("Sprint Analytics")}
                description={view?.sprint?.name ? `${t("Analytics for")} ${view.sprint.name}` : t("Performance metrics for the active sprint")}
            />

            {isLoading && !view ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading sprint analytics...")}
                </div>
            ) : !view ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("No analytics available for this sprint.")}
                </div>
            ) : (
                <>
                    {view.stats.warning && (
                        <div className="rounded-md border border-warning bg-warning-light text-warning px-4 py-3 text-sm mb-4">
                            {view.stats.warning}
                        </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <MiniStat icon={Target} label={t("Completion")} value={`${view.stats.completion}%`} tone="primary" />
                        <MiniStat icon={CheckCircle2} label={t("On-time")} value={`${view.stats.on_time_rate}%`} tone="success" />
                        <MiniStat icon={Clock} label={t("Days Left")} value={view.stats.days_left} tone={view.stats.days_left <= 2 ? "warning" : "primary"} />
                        <MiniStat icon={TriangleAlert} label={t("Blockers")} value={view.stats.open_blockers} tone={view.stats.open_blockers > 0 ? "error" : "success"} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        <div className="lg:col-span-2">
                            <ChartCard title={t("Burn Chart")} subtitle={t("Planned vs actual remaining")} height={240}>
                                <BurnChart data={view.burn} />
                            </ChartCard>
                        </div>
                        <ChartCard title={t("Completion")} subtitle={t("Sprint progress")} height={240}>
                            <div className="relative h-full">
                                <RadialProgress value={view.stats.completion} color="var(--color-success)" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-text-dark">{view.stats.completion}%</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wide">{t("complete")}</p>
                                    </div>
                                </div>
                            </div>
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <ChartCard title={t("Daily Throughput")} subtitle={t("Tasks completed per day")} height={220}>
                            <BarSeries data={view.dailyThroughput} color="var(--color-primary-medium)" valueLabel={t("Tasks")} />
                        </ChartCard>
                        <ChartCard title={t("Task Status")} subtitle={t("Current breakdown")} height={220}>
                            <DonutBreakdown data={view.taskStatus} unit={t("tasks")} />
                        </ChartCard>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-text-dark mb-3">{t("Contributors")}</h3>
                        {view.contributors.length === 0 ? (
                            <p className="text-xs text-text-muted">{t("No contributors yet.")}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {view.contributors.map((person) => (
                                    <div key={person.user_id} className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary-lighter text-primary-medium text-xs font-semibold flex items-center justify-center">
                                            {person.avatar_initials ?? initialsFor(person.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-text-dark truncate">{person.name}</p>
                                            <p className="text-[11px] text-text-muted">
                                                {person.tasks_count} {t("tasks")} · {person.hours_logged}h
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
