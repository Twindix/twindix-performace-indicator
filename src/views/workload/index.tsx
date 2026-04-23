import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, BarChart3, FolderKanban, Layers, Target, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { t, useSettings } from "@/hooks";
import { timeSeed, workloadSeed } from "@/data";
import type { TeamMemberWorkloadInterface } from "@/interfaces";
import { Avatar, AvatarFallback, Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
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

interface Aggregate {
    teamSize: number;
    assignedPoints: number;
    completedPoints: number;
    capacity: number;
    avgUtilization: number;
    overloadedCount: number;
    contextSwitches: number;
}

const aggregate = (entries: TeamMemberWorkloadInterface[]): Aggregate => {
    const memberIds = new Set(entries.map((e) => e.memberId));
    const teamSize = memberIds.size;
    const assignedPoints = entries.reduce((acc, e) => acc + e.assignedPoints, 0);
    const completedPoints = entries.reduce((acc, e) => acc + e.completedPoints, 0);
    const capacity = entries.reduce((acc, e) => acc + e.capacity, 0);
    const avgUtilization = entries.length > 0
        ? Math.round(entries.reduce((acc, e) => acc + (e.assignedPoints / Math.max(e.capacity, 1)) * 100, 0) / entries.length)
        : 0;
    const overloadedCount = entries.filter((e) => e.assignedPoints > e.capacity).length;
    const contextSwitches = entries.reduce((acc, e) => acc + e.contextSwitches, 0);
    return { teamSize, assignedPoints, completedPoints, capacity, avgUtilization, overloadedCount, contextSwitches };
};

export const WorkloadView = () => {
    const [settings] = useSettings();
    const compact = settings.compactView;

    const [scope, setScope] = useState<"projects" | "sprints" | "teams" | "members">("projects");
    const [memberSprintId, setMemberSprintId] = useState<string>(timeSeed.sprints.find((s) => s.status === "active")?.id ?? timeSeed.sprints[0]?.id ?? "");

    const getMember = (id: string) => timeSeed.members.find((m) => m.id === id);
    const getSprint = (id: string) => timeSeed.sprints.find((s) => s.id === id);

    const projectStats = useMemo(() => timeSeed.projects.map((project) => {
        const sprintIds = new Set(timeSeed.sprints.filter((s) => s.project_id === project.id).map((s) => s.id));
        const entries = workloadSeed.filter((w) => sprintIds.has(w.sprintId));
        return { project, entries, metrics: aggregate(entries) };
    }), []);

    const sprintStats = useMemo(() => timeSeed.sprints.map((sprint) => {
        const entries = workloadSeed.filter((w) => w.sprintId === sprint.id);
        return { sprint, entries, metrics: aggregate(entries) };
    }), []);

    const teamStats = useMemo(() => timeSeed.teams.map((team) => {
        const memberIds = new Set(timeSeed.members.filter((m) => m.team_id === team.id).map((m) => m.id));
        const entries = workloadSeed.filter((w) => memberIds.has(w.memberId));
        return { team, entries, metrics: aggregate(entries) };
    }), []);

    const memberEntries = useMemo(() => workloadSeed.filter((w) => w.sprintId === memberSprintId), [memberSprintId]);
    const memberMetrics = useMemo(() => aggregate(memberEntries), [memberEntries]);
    const maxAssigned = Math.max(...memberEntries.map((e) => e.assignedPoints), 1);
    const sortedByContextSwitches = useMemo(() => [...memberEntries].sort((a, b) => b.contextSwitches - a.contextSwitches), [memberEntries]);

    if (workloadSeed.length === 0) {
        return (
            <div>
                <Header title={t("Team Workload")} description={t("Track capacity across projects, sprints, teams, and members")} />
                <EmptyState icon={Users} title={t("No workload data")} description={t("No workload data available")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Team Workload")} description={t("Track capacity across projects, sprints, teams, and members")} />

            <Tabs value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                <TabsList className="mb-6">
                    <TabsTrigger value="projects"><FolderKanban className="h-4 w-4 me-1.5" />{t("Projects")}</TabsTrigger>
                    <TabsTrigger value="sprints"><Layers className="h-4 w-4 me-1.5" />{t("Sprints")}</TabsTrigger>
                    <TabsTrigger value="teams"><Users className="h-4 w-4 me-1.5" />{t("Teams")}</TabsTrigger>
                    <TabsTrigger value="members"><Target className="h-4 w-4 me-1.5" />{t("Members")}</TabsTrigger>
                </TabsList>

                <TabsContent value="projects">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectStats.map(({ project, metrics }) => (
                            <Card key={project.id}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className="truncate">{project.name}</span>
                                        <Badge variant={project.status === "active" ? "success" : project.status === "planning" ? "warning" : "secondary"}>
                                            {t(project.status)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-xs text-text-muted mb-3">{project.team_name}</p>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <ScopeStat label={t("Members")} value={metrics.teamSize} />
                                        <ScopeStat label={t("Avg Util.")} value={`${metrics.avgUtilization}%`} tone={getUtilizationTextColor(metrics.avgUtilization)} />
                                        <ScopeStat label={t("Overloaded")} value={metrics.overloadedCount} tone={metrics.overloadedCount > 0 ? "text-error" : "text-success"} />
                                        <ScopeStat label={t("Switches")} value={metrics.contextSwitches} />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                        <span>{metrics.completedPoints} / {metrics.assignedPoints} {t("points")}</span>
                                        <span>{metrics.assignedPoints > 0 ? Math.round((metrics.completedPoints / metrics.assignedPoints) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-success" style={{ width: `${metrics.assignedPoints > 0 ? Math.min(100, (metrics.completedPoints / metrics.assignedPoints) * 100) : 0}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="sprints">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sprintStats.map(({ sprint, metrics }) => (
                            <Card key={sprint.id}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className="truncate">{sprint.name}</span>
                                        <Badge variant={sprint.status === "active" ? "success" : sprint.status === "completed" ? "outline" : "secondary"}>
                                            {t(sprint.status)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-xs text-text-muted mb-1">{sprint.project_name}</p>
                                    <p className="text-xs text-text-muted mb-3">{sprint.start_date} → {sprint.end_date}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <ScopeStat label={t("Members")} value={metrics.teamSize} />
                                        <ScopeStat label={t("Avg Util.")} value={`${metrics.avgUtilization}%`} tone={getUtilizationTextColor(metrics.avgUtilization)} />
                                        <ScopeStat label={t("Overloaded")} value={metrics.overloadedCount} tone={metrics.overloadedCount > 0 ? "text-error" : "text-success"} />
                                        <ScopeStat label={t("Switches")} value={metrics.contextSwitches} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="teams">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamStats.map(({ team, metrics }) => (
                            <Card key={team.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{team.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-xs text-text-muted mb-3">{team.department}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <ScopeStat label={t("Members")} value={metrics.teamSize} />
                                        <ScopeStat label={t("Avg Util.")} value={`${metrics.avgUtilization}%`} tone={getUtilizationTextColor(metrics.avgUtilization)} />
                                        <ScopeStat label={t("Overloaded")} value={metrics.overloadedCount} tone={metrics.overloadedCount > 0 ? "text-error" : "text-success"} />
                                        <ScopeStat label={t("Switches")} value={metrics.contextSwitches} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="members">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {timeSeed.sprints.map((sprint) => (
                            <button
                                key={sprint.id}
                                onClick={() => setMemberSprintId(sprint.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    memberSprintId === sprint.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {sprint.name}
                            </button>
                        ))}
                    </div>

                    {memberEntries.length === 0 ? (
                        <EmptyState icon={Users} title={t("No workload")} description={t("No workload entries for this sprint")} />
                    ) : (
                        <>
                            <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={memberMetrics.teamSize} /></p><p className="text-xs text-text-muted">{t("Team Size")}</p></CardContent></Card>
                                <Card><CardContent className="p-4 text-center"><p className={cn("text-2xl font-bold", getUtilizationTextColor(memberMetrics.avgUtilization))}><AnimatedNumber value={memberMetrics.avgUtilization} suffix="%" /></p><p className="text-xs text-text-muted">{t("Avg Utilization")}</p></CardContent></Card>
                                <Card><CardContent className="p-4 text-center"><p className={cn("text-2xl font-bold", memberMetrics.overloadedCount > 0 ? "text-error" : "text-success")}>{memberMetrics.overloadedCount}</p><p className="text-xs text-text-muted">{t("Overloaded")}</p></CardContent></Card>
                                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={memberMetrics.contextSwitches} /></p><p className="text-xs text-text-muted">{t("Context Switches")}</p></CardContent></Card>
                            </div>

                            <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>
                                {t("Team Members")} — {getSprint(memberSprintId)?.name}
                            </h2>
                            <div className={cn("flex flex-col", compact ? "gap-2 mb-4" : "gap-3 mb-8")}>
                                {memberEntries.map((w) => {
                                    const member = getMember(w.memberId);
                                    const utilization = Math.round((w.assignedPoints / Math.max(w.capacity, 1)) * 100);
                                    const isOverloaded = w.assignedPoints > w.capacity;
                                    return (
                                        <Card key={`${w.memberId}-${w.sprintId}`}>
                                            <CardContent className={compact ? "p-3" : "p-4"}>
                                                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                                    <div className="flex items-center gap-3 md:w-48 md:shrink-0">
                                                        <Avatar className="h-9 w-9"><AvatarFallback>{member?.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-text-dark truncate">{member?.full_name ?? "Unknown"}</p>
                                                            <p className="text-xs text-text-muted truncate">{member?.role_label ?? "—"}</p>
                                                        </div>
                                                        {isOverloaded && <Badge variant="error" className="shrink-0 md:hidden"><AlertTriangle className="h-3 w-3 me-1" />{t("Overloaded")}</Badge>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-text-muted">{t("Utilization")}</span>
                                                            <span className={cn("text-xs font-bold", getUtilizationTextColor(utilization))}><AnimatedNumber value={utilization} suffix="%" /></span>
                                                        </div>
                                                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                                            <div className={cn("h-full rounded-full transition-all duration-500", getUtilizationColor(utilization))} style={{ width: `${Math.min(utilization, 100)}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 md:flex md:items-center gap-2 md:gap-0">
                                                        <div className="md:w-24 shrink-0 text-center"><p className={cn("text-sm font-bold", isOverloaded ? "text-error" : "text-text-dark")}>{w.assignedPoints}/{w.capacity}</p><p className="text-[10px] md:text-xs text-text-muted">{t("assigned")}/{t("capacity")}</p></div>
                                                        <div className="md:w-20 shrink-0 text-center"><p className="text-sm font-bold text-text-dark">{w.completedPoints}</p><p className="text-[10px] md:text-xs text-text-muted">{t("completed")}</p></div>
                                                        <div className="md:w-20 shrink-0 text-center"><div className="flex items-center justify-center gap-1"><ArrowRightLeft className={cn("h-3 w-3", w.contextSwitches >= 5 ? "text-error" : "text-text-muted")} /><span className={cn("text-sm font-bold", w.contextSwitches >= 5 ? "text-error" : "text-text-dark")}>{w.contextSwitches}</span></div><p className="text-[10px] md:text-xs text-text-muted">{t("switches")}</p></div>
                                                        <div className="md:w-20 shrink-0 text-center"><p className="text-sm font-bold text-text-dark">{w.activeTaskCount}</p><p className="text-[10px] md:text-xs text-text-muted">{t("active tasks")}</p></div>
                                                    </div>
                                                    {isOverloaded && <Badge variant="error" className="shrink-0 hidden md:inline-flex"><AlertTriangle className="h-3 w-3 me-1" />{t("Overloaded")}</Badge>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Card className="mb-6">
                                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" />{t("Workload Distribution")}</CardTitle></CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    {memberEntries.map((w) => {
                                        const member = getMember(w.memberId);
                                        const assignedWidth = (w.assignedPoints / maxAssigned) * 100;
                                        const capacityWidth = (w.capacity / maxAssigned) * 100;
                                        const isOverloaded = w.assignedPoints > w.capacity;
                                        return (
                                            <div key={`${w.memberId}-bar`}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{member?.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                        <span className="text-xs font-medium text-text-dark">{member?.full_name ?? "Unknown"}</span>
                                                    </div>
                                                    <span className={cn("text-xs font-medium", isOverloaded ? "text-error" : "text-text-secondary")}>{w.assignedPoints} / {w.capacity} {t("points")}</span>
                                                </div>
                                                <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                                                    <div className="absolute top-0 h-full border-r-2 border-dashed border-text-muted z-10" style={{ left: `${capacityWidth}%` }} />
                                                    <div className={cn("h-full rounded-full transition-all duration-500", isOverloaded ? "bg-error" : "bg-primary")} style={{ width: `${Math.min(assignedWidth, 100)}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ArrowRightLeft className="h-4 w-4 text-warning" />{t("Context Switching")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-3">
                                        {sortedByContextSwitches.map((w, index) => {
                                            const member = getMember(w.memberId);
                                            const maxSwitches = sortedByContextSwitches[0]?.contextSwitches ?? 1;
                                            const barWidth = maxSwitches > 0 ? (w.contextSwitches / maxSwitches) * 100 : 0;
                                            const isHigh = w.contextSwitches >= 5;
                                            return (
                                                <div key={`${w.memberId}-ctx`} className="flex items-center gap-3">
                                                    <span className="text-xs text-text-muted w-5 text-right shrink-0">#{index + 1}</span>
                                                    <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-[8px]">{member?.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                    <span className="text-xs font-medium text-text-dark w-32 truncate shrink-0">{member?.full_name ?? "Unknown"}</span>
                                                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-500", isHigh ? "bg-error" : "bg-warning")} style={{ width: `${Math.max(barWidth, 4)}%` }} /></div>
                                                    <span className={cn("text-xs font-bold w-6 text-right shrink-0", isHigh ? "text-error" : "text-text-dark")}><AnimatedNumber value={w.contextSwitches} /></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

interface ScopeStatProps {
    label: string;
    value: string | number;
    tone?: string;
}

const ScopeStat = ({ label, value, tone }: ScopeStatProps) => (
    <div className="rounded-md bg-muted/40 px-2 py-1.5">
        <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className={cn("text-sm font-bold", tone ?? "text-text-dark")}>{value}</p>
    </div>
);
