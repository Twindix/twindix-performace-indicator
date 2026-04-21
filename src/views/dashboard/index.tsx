import { AlertTriangle, Bell, Flag, MessageCircle, TrendingUp, Zap, XCircle } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { Header, ScoreGauge, StatusBadge } from "@/components/shared";
import { DashboardSkeleton } from "@/components/skeletons";
import { MetricStatus } from "@/enums";
import { t, useCountUp, useDashboard, usePageLoader, useSettings } from "@/hooks";
import { useSprintStore } from "@/store";
import { cn } from "@/utils";

const frictionAreaConfig: Array<{ key: string; labelKey: string; icon: typeof Bell; textColor: string }> = [
    { key: "alert_response",    labelKey: "Alert Response",     icon: Bell,           textColor: "text-blue-500" },
    { key: "red_flag_response", labelKey: "Red Flag Response",  icon: Flag,           textColor: "text-error" },
    { key: "time_delivery",     labelKey: "Time Delivery",      icon: Zap,            textColor: "text-success" },
    { key: "comments_response", labelKey: "Comments Response",  icon: MessageCircle,  textColor: "text-purple-500" },
    { key: "not_approval",      labelKey: "Not Approval (%)",   icon: XCircle,        textColor: "text-warning" },
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
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();
    const { healthScore, metrics, isLoading: isFetching } = useDashboard(activeSprintId);

    if (pageLoading || isFetching) return <DashboardSkeleton />;

    const overallScore = healthScore?.overall ?? 0;
    const subScores = healthScore?.sub_scores ?? {};
    const summary = healthScore?.summary;
    const activeBlockers = healthScore?.active_blockers ?? [];

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
                                <p className="text-2xl font-bold text-text-dark"><AnimNum value={summary?.total_tasks ?? 0} /></p>
                                <p className="text-xs text-text-muted">{t("Total Tasks")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-error"><AnimNum value={summary?.active_blockers ?? 0} /></p>
                                <p className="text-xs text-text-muted">{t("Active Blockers")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark"><AnimNum value={summary?.completed_tasks ?? 0} /></p>
                                <p className="text-xs text-text-muted">{t("Completed")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Friction Areas Grid */}
                <div className={cn("lg:col-span-2 grid grid-cols-2 stagger-children", compact ? "gap-2" : "gap-3")}>
                    {frictionAreaConfig.map(({ key, labelKey, icon: Icon, textColor }) => {
                        const sub = subScores[key];
                        const score = sub?.score ?? 0;
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

            {/* Performance Metrics */}
            {metrics && (
                <div className={compact ? "mb-3" : "mb-6"}>
                    <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>{t("Performance Metrics")}</h2>
                    <div className={cn("grid grid-cols-2 lg:grid-cols-4 stagger-children", compact ? "gap-2" : "gap-3")}>
                        <MetricBox label={t("On-Time Delivery")} value={metrics.on_time_delivery_rate} suffix="%" />
                        <MetricBox label={t("Task Rejection")} value={metrics.task_rejection_rate} suffix="%" />
                        <MetricBox label={t("Urgent Alerts")} value={metrics.urgent_alert_count} />
                        <MetricBox label={t("Stalled Red Flags")} value={metrics.stalled_red_flags} />
                        <MetricBox label={t("Total Red Flags")} value={metrics.total_red_flags} />
                        <MetricBox label={t("Total Comments")} value={metrics.total_comments} />
                        <MetricBox label={t("Responded Comments")} value={metrics.responded_comments} />
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
                                    <span className="text-xs text-text-muted">{Math.round(b.duration_days * 10) / 10} {t("days")} {t("blocked")}</span>
                                    <Badge variant={b.severity === "critical" ? "error" : b.severity === "high" ? "warning" : "secondary"}>
                                        {t(b.severity.charAt(0).toUpperCase() + b.severity.slice(1))}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const MetricBox = ({ label, value, suffix }: { label: string; value: number; suffix?: string }) => (
    <Card>
        <CardContent className="p-3">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="text-xl font-semibold text-text-dark">
                <AnimNum value={Math.round(value * 10) / 10} />{suffix}
            </p>
        </CardContent>
    </Card>
);
