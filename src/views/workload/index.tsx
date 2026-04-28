import { useMemo } from "react";
import { AlertTriangle, ArrowRightLeft, BarChart3, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { WorkloadSkeleton } from "@/components/skeletons";
import { usersConstants } from "@/constants";
import { t } from "@/utils";
import { useSettings, usePageLoader } from "@/hooks";
import type { TeamMemberWorkloadInterface, UserInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { cn } from "@/utils";

const getUtilizationColor = (util: number): string => {
    if (util > 100) return "bg-error";
    if (util >= 85) return "bg-warning";
    return "bg-success";
};

const getUtilizationTextColor = (util: number): string => {
    if (util > 100) return "text-error";
    if (util >= 85) return "text-warning";
    return "text-success";
};

export const WorkloadView = () => {
    const isLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const sprintWorkload: TeamMemberWorkloadInterface[] = [];
    const members: UserInterface[] = [];

    const getMember = (id: string) => members.find((m) => m.id === id);

    const stats = useMemo(() => {
        const teamSize = sprintWorkload.length;
        const avgUtilization =
            teamSize > 0
                ? Math.round(sprintWorkload.reduce((acc, w) => acc + (w.assignedPoints / w.capacity) * 100, 0) / teamSize)
                : 0;
        const overloadedCount = sprintWorkload.filter((w) => w.assignedPoints > w.capacity).length;
        const totalContextSwitches = sprintWorkload.reduce((acc, w) => acc + w.contextSwitches, 0);
        return { teamSize, avgUtilization, overloadedCount, totalContextSwitches };
    }, [sprintWorkload]);

    const sortedByContextSwitches = useMemo(
        () => [...sprintWorkload].sort((a, b) => b.contextSwitches - a.contextSwitches),
        [sprintWorkload],
    );

    const maxAssigned = useMemo(
        () => Math.max(...sprintWorkload.map((w) => w.assignedPoints), 1),
        [sprintWorkload],
    );

    if (isLoading) return <WorkloadSkeleton />;

    if (sprintWorkload.length === 0) {
        return (
            <div>
                <Header title={t("Team Workload")} description={t("Track team capacity, utilization, and context switching")} />
                <EmptyState icon={Users} title={t("No workload data")} description={t("No workload data available for this sprint")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Team Workload")} description={t("Track team capacity, utilization, and context switching")} />

            {/* Stats Row */}
            <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.teamSize} /></p>
                        <p className="text-xs text-text-muted">{t("Team Size")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className={cn("text-2xl font-bold", getUtilizationTextColor(stats.avgUtilization))}>
                            <AnimatedNumber value={stats.avgUtilization} suffix="%" />
                        </p>
                        <p className="text-xs text-text-muted">{t("Avg Utilization")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className={cn("text-2xl font-bold", stats.overloadedCount > 0 ? "text-error" : "text-success")}>
                            {stats.overloadedCount}
                        </p>
                        <p className="text-xs text-text-muted">{t("Overloaded")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.totalContextSwitches} /></p>
                        <p className="text-xs text-text-muted">{t("Context Switches")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Member Detail Cards */}
            <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>{t("Team Members")}</h2>
            <div className={cn("flex flex-col", compact ? "gap-2 mb-4" : "gap-3 mb-8")}>
                {sprintWorkload.map((w) => {
                    const member = getMember(w.memberId);
                    const utilization = Math.round((w.assignedPoints / w.capacity) * 100);
                    const isOverloaded = w.assignedPoints > w.capacity;

                    return (
                        <Card key={w.memberId}>
                            <CardContent className={compact ? "p-3" : "p-4"}>
                                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                    {/* Avatar + Name + Overloaded (mobile) */}
                                    <div className="flex items-center gap-3 md:w-48 md:shrink-0">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{member?.avatar_initials ?? "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-text-dark truncate">{member?.full_name ?? "Unknown"}</p>
                                            <p className="text-xs text-text-muted truncate">{member?.role_tier ? usersConstants.roleTierLabels[member.role_tier] : ""}</p>
                                        </div>
                                        {isOverloaded && (
                                            <Badge variant="error" className="shrink-0 md:hidden">
                                                <AlertTriangle className="h-3 w-3 me-1" />
                                                {t("Overloaded")}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Utilization Bar */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-text-muted">{t("Utilization")}</span>
                                            <span className={cn("text-xs font-bold", getUtilizationTextColor(utilization))}>
                                                <AnimatedNumber value={utilization} suffix="%" />
                                            </span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-500 progress-animated", getUtilizationColor(utilization))}
                                                style={{ width: `${Math.min(utilization, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-4 md:flex md:items-center gap-2 md:gap-0">
                                        <div className="md:w-24 shrink-0 text-center">
                                            <p className={cn("text-sm font-bold", isOverloaded ? "text-error" : "text-text-dark")}>
                                                {w.assignedPoints}/{w.capacity}
                                            </p>
                                            <p className="text-[10px] md:text-xs text-text-muted">{t("assigned")}/{t("capacity")}</p>
                                        </div>
                                        <div className="md:w-20 shrink-0 text-center">
                                            <p className="text-sm font-bold text-text-dark">{w.completedPoints}</p>
                                            <p className="text-[10px] md:text-xs text-text-muted">{t("completed")}</p>
                                        </div>
                                        <div className="md:w-20 shrink-0 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <ArrowRightLeft className={cn("h-3 w-3", w.contextSwitches >= 5 ? "text-error" : "text-text-muted")} />
                                                <span className={cn("text-sm font-bold", w.contextSwitches >= 5 ? "text-error" : "text-text-dark")}>
                                                    {w.contextSwitches}
                                                </span>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-text-muted">{t("switches")}</p>
                                        </div>
                                        <div className="md:w-20 shrink-0 text-center">
                                            <p className="text-sm font-bold text-text-dark">{w.activeTaskCount}</p>
                                            <p className="text-[10px] md:text-xs text-text-muted">{t("active tasks")}</p>
                                        </div>
                                    </div>

                                    {/* Overloaded (desktop) */}
                                    {isOverloaded && (
                                        <Badge variant="error" className="shrink-0 hidden md:inline-flex">
                                            <AlertTriangle className="h-3 w-3 me-1" />
                                            {t("Overloaded")}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Workload Distribution */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        {t("Workload Distribution")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {sprintWorkload.map((w) => {
                        const member = getMember(w.memberId);
                        const assignedWidth = (w.assignedPoints / maxAssigned) * 100;
                        const capacityWidth = (w.capacity / maxAssigned) * 100;
                        const isOverloaded = w.assignedPoints > w.capacity;
                        return (
                            <div key={w.memberId}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-[8px]">{member?.avatar_initials ?? "?"}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-text-dark">{member?.full_name ?? "Unknown"}</span>
                                    </div>
                                    <span className={cn("text-xs font-medium", isOverloaded ? "text-error" : "text-text-secondary")}>
                                        {w.assignedPoints} / {w.capacity} {t("points")}
                                    </span>
                                </div>
                                <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                                    {/* Capacity marker */}
                                    <div
                                        className="absolute top-0 h-full border-r-2 border-dashed border-text-muted z-10"
                                        style={{ left: `${capacityWidth}%` }}
                                    />
                                    {/* Assigned bar */}
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500 progress-animated",
                                            isOverloaded ? "bg-error" : "bg-primary",
                                        )}
                                        style={{ width: `${Math.min(assignedWidth, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-text-muted">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-6 rounded bg-primary" />
                            <span>{t("Assigned")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-6 rounded bg-error" />
                            <span>{t("Over capacity")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-0 border-r-2 border-dashed border-text-muted" />
                            <span>{t("Capacity limit")}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Context Switching */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ArrowRightLeft className="h-4 w-4 text-warning" />
                        {t("Context Switching")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        {sortedByContextSwitches.map((w, index) => {
                            const member = getMember(w.memberId);
                            const maxSwitches = sortedByContextSwitches[0]?.contextSwitches ?? 1;
                            const barWidth = maxSwitches > 0 ? (w.contextSwitches / maxSwitches) * 100 : 0;
                            const isHigh = w.contextSwitches >= 5;
                            return (
                                <div key={w.memberId} className="flex items-center gap-3">
                                    <span className="text-xs text-text-muted w-5 text-right shrink-0">#{index + 1}</span>
                                    <Avatar className="h-6 w-6 shrink-0">
                                        <AvatarFallback className="text-[8px]">{member?.avatar_initials ?? "?"}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium text-text-dark w-32 truncate shrink-0">{member?.full_name ?? "Unknown"}</span>
                                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500 progress-animated", isHigh ? "bg-error" : "bg-warning")}
                                            style={{ width: `${Math.max(barWidth, 4)}%` }}
                                        />
                                    </div>
                                    <span className={cn("text-xs font-bold w-6 text-right shrink-0", isHigh ? "text-error" : "text-text-dark")}>
                                        <AnimatedNumber value={w.contextSwitches} />
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
