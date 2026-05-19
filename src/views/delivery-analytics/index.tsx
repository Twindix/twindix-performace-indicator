import { Activity, AlertTriangle, CheckCircle2, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header } from "@/components/shared";
import { t, useDeliveryAnalytics, useSprintsList } from "@/hooks";
import { useSprintStore } from "@/store";
import { cn } from "@/utils";

const KpiCard = ({ icon: Icon, label, value, tone = "primary" }: {
    icon: typeof Target;
    label: string;
    value: string;
    tone?: "primary" | "success" | "warning" | "error";
}) => {
    const toneClass = {
        primary: "text-primary-medium bg-primary-lighter",
        success: "text-success bg-success-light",
        warning: "text-warning bg-warning-light",
        error: "text-error bg-error-light",
    }[tone];
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
                <div className={`h-9 w-9 rounded-md flex items-center justify-center ${toneClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
            </div>
            <p className="text-2xl font-bold text-text-dark">{value}</p>
        </div>
    );
};

export const DeliveryAnalyticsView = () => {
    const { activeSprintId } = useSprintStore();
    const { sprints } = useSprintsList();
    const { data, isLoading } = useDeliveryAnalytics(activeSprintId);

    const activeSprint = sprints.find((s) => s.id === activeSprintId);

    if (!data) {
        return (
            <div>
                <Header
                    title={t("Delivery Analytics")}
                    description={t("Sprint delivery metrics — completion rate, story points, and task breakdown.")}
                />
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {isLoading ? t("Loading delivery analytics...") : t("No delivery analytics available for this sprint.")}
                </div>
            </div>
        );
    }

    const extractCount = (v: { total: number; completed: number } | number) =>
        typeof v === "object" ? v.total : v;
    const byPriority = Object.entries(data.by_priority ?? {}).map(([k, v]) => [k, extractCount(v)] as [string, number]);
    const byStatus = Object.entries(data.by_status ?? {}).map(([k, v]) => [k, extractCount(v)] as [string, number]);

    return (
        <div>
            <Header
                title={t("Delivery Analytics")}
                description={activeSprint ? `${activeSprint.name}` : t("Sprint delivery metrics")}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KpiCard
                    icon={Activity}
                    label={t("Completion Rate")}
                    value={`${data.completion_rate}%`}
                    tone={data.completion_rate >= 80 ? "success" : data.completion_rate >= 60 ? "warning" : "error"}
                />
                <KpiCard icon={CheckCircle2} label={t("Tasks Completed")} value={`${data.completed_tasks}/${data.total_tasks}`} tone="primary" />
                <KpiCard
                    icon={Target}
                    label={t("Story Points")}
                    value={`${data.completed_story_points}/${data.total_story_points}`}
                    tone="primary"
                />
                <KpiCard
                    icon={AlertTriangle}
                    label={t("Story Point Rate")}
                    value={`${data.story_point_completion_rate}%`}
                    tone={data.story_point_completion_rate >= 80 ? "success" : "warning"}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg border border-error/40 bg-error-light/20 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">{t("Overdue Tasks")}</p>
                    <p className="text-2xl font-bold text-error"><AnimatedNumber value={data.overdue_tasks} /></p>
                </div>
                <div className="rounded-lg border border-warning/40 bg-warning-light/20 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">{t("Blocked Tasks")}</p>
                    <p className="text-2xl font-bold text-warning"><AnimatedNumber value={data.blocked_tasks} /></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {byPriority.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{t("Tasks by Priority")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {byPriority.map(([priority, count]) => {
                                    const pct = data.total_tasks > 0 ? Math.round((count / data.total_tasks) * 100) : 0;
                                    return (
                                        <div key={priority}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-text-dark capitalize">{t(priority)}</span>
                                                <span className="text-text-muted">{count} ({pct}%)</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {byStatus.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{t("Tasks by Status")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {byStatus.map(([status, count]) => {
                                    const pct = data.total_tasks > 0 ? Math.round((count / data.total_tasks) * 100) : 0;
                                    const color = status === "done" || status === "completed"
                                        ? "bg-success"
                                        : status === "in_progress" || status === "in-progress"
                                            ? "bg-primary"
                                            : status === "blocked"
                                                ? "bg-error"
                                                : "bg-muted-foreground";
                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className={cn("text-text-dark capitalize")}>{t(status.replace(/_/g, " "))}</span>
                                                <span className="text-text-muted">{count} ({pct}%)</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
