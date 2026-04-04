import { AlertTriangle, BookOpen, Clock, GitBranch, MessageSquare, Shield, TrendingUp, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { Header, MetricCard, ScoreGauge, StatusBadge } from "@/components/shared";
import { BlockerStatus, MetricStatus } from "@/enums";
import { t, useSettings } from "@/hooks";
import type { BlockerInterface, SprintMetricsInterface, TaskInterface, DecisionInterface, UserInterface, TeamMemberWorkloadInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

const frictionAreaConfig = [
    { key: "poorRequirements" as const, label: "Poor Requirements", icon: AlertTriangle, color: "bg-friction-requirements", textColor: "text-friction-requirements" },
    { key: "communicationGaps" as const, label: "Communication Gaps", icon: MessageSquare, color: "bg-friction-communication", textColor: "text-friction-communication" },
    { key: "weakOwnership" as const, label: "Weak Ownership", icon: Shield, color: "bg-friction-ownership", textColor: "text-friction-ownership" },
    { key: "dependencyBlockers" as const, label: "Dependency Blockers", icon: GitBranch, color: "bg-friction-dependencies", textColor: "text-friction-dependencies" },
    { key: "processGaps" as const, label: "Process Gaps", icon: Clock, color: "bg-friction-process", textColor: "text-friction-process" },
    { key: "teamCulture" as const, label: "Team & Culture", icon: Users, color: "bg-friction-team", textColor: "text-friction-team" },
];

const getScoreStatus = (score: number): MetricStatus => {
    if (score >= 80) return MetricStatus.Healthy;
    if (score >= 60) return MetricStatus.Warning;
    return MetricStatus.Critical;
};

export const DashboardView = () => {
    useSettings();
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

    return (
        <div>
            <Header title={t("Sprint Dashboard")} description={t("Real-time overview of sprint health, delivery friction, and team performance")} />

            {/* Hero Section: Health Score + Friction Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Health Score */}
                <Card className="lg:row-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {t("Sprint Health Score")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <ScoreGauge score={sprintMetrics?.healthScore ?? 0} size="lg" label={t("Health")} />
                        <StatusBadge status={getScoreStatus(sprintMetrics?.healthScore ?? 0)} />
                        <div className="w-full grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark">{tasks.length}</p>
                                <p className="text-xs text-text-muted">{t("Total Tasks")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-error">{activeBlockers.length}</p>
                                <p className="text-xs text-text-muted">{t("Active Blockers")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-text-dark">{tasks.filter((t) => t.phase === "done").length}</p>
                                <p className="text-xs text-text-muted">{t("Completed")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Friction Areas Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {frictionAreaConfig.map(({ key, label, icon: Icon, textColor }) => {
                        const score = sprintMetrics?.frictionScores[key] ?? 0;
                        return (
                            <Card key={key} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className={cn("h-4 w-4", textColor)} />
                                        <span className="text-xs font-medium text-text-secondary truncate">{label}</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className={cn("text-2xl font-bold", textColor)}>{score}</span>
                                        <StatusBadge status={getScoreStatus(score)} />
                                    </div>
                                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-500", score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-error")} style={{ width: `${score}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-text-dark mb-3">{t("Key Metrics")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {topMetrics.map((m) => (
                        <MetricCard key={m.id} name={m.name} value={m.value} unit={m.unit} status={m.status} trend={m.trend} trendPercent={m.trendPercent} description={m.description} />
                    ))}
                </div>
            </div>

            {/* Bottom Section: Blockers + Decisions + Workload */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                        <span className="text-xs text-text-muted">{b.durationDays}d blocked</span>
                                        <Badge variant={b.impact === "critical" ? "error" : b.impact === "high" ? "warning" : "secondary"}>{b.impact}</Badge>
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
                                        <Badge variant={d.status === "approved" ? "success" : d.status === "pending" ? "warning" : "secondary"}>{d.status}</Badge>
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
                                            <span className={cn("text-xs font-bold", isOverloaded ? "text-error" : "text-text-secondary")}>{utilization}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all", isOverloaded ? "bg-error" : utilization > 85 ? "bg-warning" : "bg-primary")} style={{ width: `${Math.min(utilization, 100)}%` }} />
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
