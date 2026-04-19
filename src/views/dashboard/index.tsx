import { AlertTriangle, Bell, Flag, MessageCircle, TrendingUp, Zap, XCircle } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { Header, MetricCard, ScoreGauge, StatusBadge } from "@/components/shared";
import { DashboardSkeleton } from "@/components/skeletons";
import { DashboardProvider, useDashboard } from "@/contexts";
import { MetricStatus } from "@/enums";
import { t, useSettings, useCountUp, usePageLoader } from "@/hooks";
import { useSprintStore } from "@/store";
import { cn } from "@/utils";

const frictionAreaConfig = [
    { key: "alertResponse", labelKey: "Alert Response", icon: Bell, textColor: "text-blue-500" },
    { key: "redFlagResponse", labelKey: "Red Flag Response", icon: Flag, textColor: "text-error" },
    { key: "deliveryTime", labelKey: "Time Delivery", icon: Zap, textColor: "text-success" },
    { key: "commentsResponse", labelKey: "Comments Response", icon: MessageCircle, textColor: "text-purple-500" },
    { key: "rejectionRate", labelKey: "Not Approval (%)", icon: XCircle, textColor: "text-warning" },
];

const getScoreStatus = (score: number): MetricStatus => {
    if (score >= 80) return MetricStatus.Healthy;
    if (score >= 60) return MetricStatus.Warning;
    return MetricStatus.Critical;
};

const AnimNum = ({ value, className }: { value: number; className?: string }) => {
    const animated = useCountUp(value);
    return <span className={className}>{animated}</span>;
};

export const DashboardView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <DashboardProvider sprintId={activeSprintId}>
            <DashboardViewInner />
        </DashboardProvider>
    );
};

type FrictionKey = "alertResponse" | "redFlagResponse" | "deliveryTime" | "commentsResponse" | "rejectionRate";

const readNum = (obj: unknown, key: string): number | undefined => {
    if (!obj || typeof obj !== "object") return undefined;
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "number" ? v : undefined;
};

const DashboardViewInner = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { dashboard, healthScore, metrics, isLoading: isFetching } = useDashboard();

    if (pageLoading || isFetching) return <DashboardSkeleton />;

    const overallScore = healthScore?.overall_score ?? 0;
    const subScores = healthScore?.sub_scores ?? {};
    const frictionScore = (k: FrictionKey): number => {
        const raw = subScores[k] ?? subScores[k.replace(/([A-Z])/g, "_$1").toLowerCase()];
        return typeof raw === "number" ? raw : 0;
    };

    const totalTasks = metrics?.total_tasks ?? 0;
    const completedTasks = metrics?.completed_tasks ?? 0;
    const activeBlockersCount = metrics?.active_blockers ?? 0;

    const rawBlockers = Array.isArray(dashboard?.active_blockers) ? dashboard!.active_blockers : [];
    const activeBlockers = rawBlockers.map((b, i) => {
        const rec = (b ?? {}) as Record<string, unknown>;
        return {
            id: (rec.id as string) ?? `bl-${i}`,
            title: (rec.title as string) ?? "",
            durationDays: readNum(b, "duration_days") ?? readNum(b, "durationDays") ?? 0,
            impact: (rec.impact as string) ?? "medium",
        };
    });

    const topMetrics = Array.isArray(dashboard?.top_metrics) ? (dashboard!.top_metrics as Array<Record<string, unknown>>) : [];

    return (
        <div>
            <Header title={t("Sprint Dashboard")} description={t("Real-time overview of sprint health, delivery friction, and team performance")} />

            {/* Hero Section: Health Score + Friction Areas */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-3 stagger-children", compact ? "gap-3 mb-3" : "gap-6 mb-6")}>
                {/* Health Score */}
                <Card className="lg:row-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {t("Sprint Performance Score")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <ScoreGauge score={overallScore} size="lg" label={t("Health")} />
                        <StatusBadge status={getScoreStatus(overallScore)} />
                        <div className="w-full grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark"><AnimNum value={totalTasks} /></p>
                                <p className="text-xs text-text-muted">{t("Total Tasks")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-error"><AnimNum value={activeBlockersCount} /></p>
                                <p className="text-xs text-text-muted">{t("Active Blockers")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark"><AnimNum value={completedTasks} /></p>
                                <p className="text-xs text-text-muted">{t("Completed")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Friction Areas Grid */}
                <div className={cn("lg:col-span-2 grid grid-cols-2 stagger-children", compact ? "gap-2" : "gap-3")}>
                    {frictionAreaConfig.map(({ key, labelKey, icon: Icon, textColor }) => {
                        const score = frictionScore(key as FrictionKey);
                        return (
                            <Card key={key} className="overflow-hidden">
                                <CardContent className={compact ? "p-3" : "p-4"}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className={cn("h-4 w-4", textColor)} />
                                        <span className="text-xs font-medium text-text-secondary truncate">{t(labelKey)}</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <AnimNum value={score} className={cn("text-2xl font-bold", textColor)} />
                                        <StatusBadge status={getScoreStatus(score)} />
                                    </div>
                                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-500 progress-animated", score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-error")} style={{ width: `${score}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Performance Metrics Row */}
            {topMetrics.length > 0 && (
                <div className={compact ? "mb-3" : "mb-6"}>
                    <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>{t("Performance Metrics")}</h2>
                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children", compact ? "gap-2" : "gap-3")}>
                        {topMetrics.map((m, i) => (
                            <MetricCard
                                key={(m.id as string) ?? i}
                                name={(m.name as string) ?? ""}
                                value={readNum(m, "value") ?? 0}
                                unit={(m.unit as string) ?? ""}
                                status={(m.status as MetricStatus) ?? MetricStatus.Healthy}
                                trend={(m.trend as "up" | "down" | "flat") ?? "flat"}
                                trendPercent={readNum(m, "trend_percent") ?? readNum(m, "trendPercent") ?? 0}
                                description={(m.description as string) ?? ""}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Section: Active Blockers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-error" />
                        {t("Active Blockers")}
                        <Badge variant="error">{activeBlockers.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {activeBlockers.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-4">{t("No active blockers")}</p>
                    ) : activeBlockers.map((b) => (
                        <div key={b.id} className="flex items-start gap-3 rounded-xl bg-error-light p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10">
                                <AlertTriangle className="h-4 w-4 text-error" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-dark truncate">{b.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-text-muted">{b.durationDays} {t("days")} {t("blocked")}</span>
                                    <Badge variant={b.impact === "critical" ? "error" : b.impact === "high" ? "warning" : "secondary"}>{t(b.impact.charAt(0).toUpperCase() + b.impact.slice(1))}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
