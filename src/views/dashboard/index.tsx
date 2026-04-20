import { AlertTriangle, Bell, Flag, MessageCircle, TrendingUp, Zap, XCircle } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { Header, ScoreGauge, StatusBadge } from "@/components/shared";
import { DashboardSkeleton } from "@/components/skeletons";
import { DashboardProvider, useDashboard } from "@/contexts";
import { MetricStatus } from "@/enums";
import { t, useSettings, useCountUp, usePageLoader } from "@/hooks";
import { useSprintStore } from "@/store";
import { cn } from "@/utils";

const frictionAreaConfig = [
    { key: "alert_response",    labelKey: "Alert Response",      icon: Bell,           textColor: "text-blue-500" },
    { key: "red_flag_response", labelKey: "Red Flag Response",   icon: Flag,           textColor: "text-error" },
    { key: "time_delivery",     labelKey: "Time Delivery",       icon: Zap,            textColor: "text-success" },
    { key: "comments_response", labelKey: "Comments Response",   icon: MessageCircle,  textColor: "text-purple-500" },
    { key: "not_approval",      labelKey: "Not Approval (%)",    icon: XCircle,        textColor: "text-warning" },
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

const DashboardViewInner = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { dashboard, healthScore, isLoading: isFetching } = useDashboard();

    if (pageLoading || isFetching) return <DashboardSkeleton />;

    const overallScore = healthScore?.overall ?? 0;
    const subScores = healthScore?.sub_scores ?? {};
    const frictionScore = (key: string): number => {
        const raw = subScores[key];
        return typeof raw === "object" && raw !== null ? (raw as { score: number }).score : 0;
    };

    // summary is at dashboard root, not inside health_score
    const totalTasks = dashboard?.summary?.total_tasks ?? 0;
    const completedTasks = dashboard?.summary?.completed_tasks ?? 0;
    const activeBlockersCount = dashboard?.summary?.active_blockers ?? 0;

    // active_blockers is inside health_score
    const rawBlockers = healthScore?.active_blockers ?? [];
    const activeBlockers = rawBlockers.map((b) => ({
        id: b.id,
        title: b.title,
        durationDays: b.duration_days ?? 0,
        severity: b.severity ?? "medium",
    }));

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
                        const score = frictionScore(key);
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

            {/* Active Blockers */}
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
