import { AlertTriangle, Bell, BookOpen, Flag, MessageCircle, TrendingUp, Users, Zap, XCircle } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header, MetricCard, ScoreGauge, StatusBadge } from "@/components/shared";
import { DashboardSkeleton } from "@/components/skeletons";
import { BlockerStatus, MetricStatus } from "@/enums";
import { t, useSettings, useCountUp, usePageLoader } from "@/hooks";
import type { BlockerInterface, SprintMetricsInterface, TaskInterface, DecisionInterface, UserInterface, TeamMemberWorkloadInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

const frictionAreaConfig = [
    { key: "alertResponse" as const, labelKey: "Alert Response", icon: Bell, color: "bg-blue-500/10", textColor: "text-blue-500" },
    { key: "redFlagResponse" as const, labelKey: "Red Flag Response", icon: Flag, color: "bg-error/10", textColor: "text-error" },
    { key: "deliveryTime" as const, labelKey: "Time Delivery", icon: Zap, color: "bg-success/10", textColor: "text-success" },
    { key: "commentsResponse" as const, labelKey: "Comments Response", icon: MessageCircle, color: "bg-purple-500/10", textColor: "text-purple-500" },
    { key: "rejectionRate" as const, labelKey: "Not Approval (%)", icon: XCircle, color: "bg-warning/10", textColor: "text-warning" },
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
    const isLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();
    const allMetrics = getStorageItem<SprintMetricsInterface[]>(storageKeys.metrics) ?? [];
    const sprintMetrics = allMetrics.find((m) => m.sprintId === activeSprintId);
    const tasks = (getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? []).filter((t) => t.sprintId === activeSprintId);
    const blockers = (getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? []).filter((b) => b.sprintId === activeSprintId);
    const decisions = (getStorageItem<DecisionInterface[]>(storageKeys.decisions) ?? []).filter((d) => d.sprintId === activeSprintId);
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const workload = (getStorageItem<TeamMemberWorkloadInterface[]>(storageKeys.workload) ?? []).filter((w) => w.sprintId === activeSprintId);
    const activeBlockers = blockers.filter((b) => b.status === BlockerStatus.Active || b.status === BlockerStatus.Escalated);
    const topMetrics = sprintMetrics?.metrics.slice(0, 8) ?? [];

    const getMember = (id: string) => members.find((m) => m.id === id);

    if (isLoading) return <DashboardSkeleton />;

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
                        <ScoreGauge score={sprintMetrics?.healthScore ?? 0} size="lg" label={t("Health")} />
                        <StatusBadge status={getScoreStatus(sprintMetrics?.healthScore ?? 0)} />
                        <div className="w-full grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark"><AnimNum value={tasks.length} /></p>
                                <p className="text-xs text-text-muted">{t("Total Tasks")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-error"><AnimNum value={activeBlockers.length} /></p>
                                <p className="text-xs text-text-muted">{t("Active Blockers")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark"><AnimNum value={tasks.filter((tk) => tk.phase === "done").length} /></p>
                                <p className="text-xs text-text-muted">{t("Completed")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Friction Areas Grid */}
                <div className={cn("lg:col-span-2 grid grid-cols-2 stagger-children", compact ? "gap-2" : "gap-3")}>
                    {frictionAreaConfig.map(({ key, labelKey, icon: Icon, textColor }) => {
                        const score = sprintMetrics?.frictionScores[key] ?? 0;
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
            <div className={compact ? "mb-3" : "mb-6"}>
                <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>{t("Performance Metrics")}</h2>
                <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children", compact ? "gap-2" : "gap-3")}>
                    {topMetrics.map((m) => (
                        <MetricCard key={m.id} name={m.name} value={m.value} unit={m.unit} status={m.status} trend={m.trend} trendPercent={m.trendPercent} description={m.description} />
                    ))}
                </div>
            </div>

            {/* Bottom Section: Blockers + Decisions + Workload */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-3 stagger-children", compact ? "gap-3" : "gap-6")}>
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
                                        <Badge variant={b.impact === "critical" ? "error" : b.impact === "high" ? "warning" : "secondary"}>{t(b.impact.charAt(0).toUpperCase() + b.impact.slice(1))}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Decisions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="h-4 w-4 text-primary" />
                            {t("Recent Decisions")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {decisions.slice(0, 5).map((d) => (
                            <div key={d.id} className="flex items-start gap-3">
                                <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", d.status === "approved" ? "bg-success" : d.status === "pending" ? "bg-warning" : d.status === "rejected" ? "bg-error" : "bg-text-muted")} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-dark truncate">{d.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-text-muted">{formatDate(d.createdAt)}</span>
                                        <Badge variant={d.status === "approved" ? "success" : d.status === "pending" ? "warning" : "secondary"}>{t(d.status.charAt(0).toUpperCase() + d.status.slice(1))}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Team Workload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4 text-secondary" />
                            {t("Team Workload")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {workload.map((w) => {
                            const member = getMember(w.memberId);
                            const utilization = Math.round((w.assignedPoints / w.capacity) * 100);
                            const isOverloaded = utilization > 100;
                            return (
                                <div key={w.memberId} className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-[9px]">{member?.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-text-dark truncate">{member?.name}</span>
                                            <span className={cn("text-xs font-bold", isOverloaded ? "text-error" : "text-text-secondary")}><AnimatedNumber value={utilization} suffix="%" /></span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all progress-animated", isOverloaded ? "bg-error" : utilization > 85 ? "bg-warning" : "bg-primary")} style={{ width: `${Math.min(utilization, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
