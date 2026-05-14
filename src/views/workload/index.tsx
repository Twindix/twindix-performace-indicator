import { useState } from "react";
import { AlertTriangle, ArrowRightLeft, BarChart3, FolderKanban, Layers, Target, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import {
    t,
    useSettings,
    useSprintsList,
    useWorkloadByMember,
    useWorkloadByProject,
    useWorkloadBySprint,
    useWorkloadByTeam,
} from "@/hooks";
import { useSprintStore } from "@/store";
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

export const WorkloadView = () => {
    const [settings] = useSettings();
    const compact = settings.compactView;

    const [scope, setScope] = useState<"projects" | "sprints" | "teams" | "members">("projects");

    const activeSprintId = useSprintStore((s) => s.activeSprintId);
    const { sprints } = useSprintsList();
    const [memberSprintId, setMemberSprintId] = useState<string>(activeSprintId ?? "");

    const { rows: projectRows, isLoading: loadingProjects } = useWorkloadByProject();
    const { rows: sprintRows, isLoading: loadingSprints } = useWorkloadBySprint();
    const { rows: teamRows, isLoading: loadingTeams } = useWorkloadByTeam();
    const { rows: memberRows, isLoading: loadingMembers } = useWorkloadByMember({ sprint_id: memberSprintId || undefined });

    const maxAssigned = Math.max(...memberRows.map((m) => m.assigned), 1);
    const sortedByContextSwitches = [...memberRows].sort((a, b) => b.context_switches - a.context_switches);

    const memberTotals = {
        teamSize: memberRows.length,
        avgUtilization: memberRows.length > 0
            ? Math.round(memberRows.reduce((acc, m) => acc + m.utilization, 0) / memberRows.length)
            : 0,
        overloadedCount: memberRows.filter((m) => m.overloaded).length,
        contextSwitches: memberRows.reduce((acc, m) => acc + m.context_switches, 0),
    };

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
                    {loadingProjects ? (
                        <LoadingTile />
                    ) : projectRows.length === 0 ? (
                        <EmptyState icon={FolderKanban} title={t("No workload data")} description={t("No project workload available")} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectRows.map((row) => (
                                <Card key={row.project_id}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span className="truncate">{row.project_name}</span>
                                            <Badge variant={row.project_status === "active" ? "success" : row.project_status === "planning" ? "warning" : "secondary"}>
                                                {t(row.project_status)}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-xs text-text-muted mb-3">{row.team_name}</p>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <ScopeStat label={t("Members")} value={row.member_count} />
                                            <ScopeStat label={t("Avg Util.")} value={`${row.avg_utilization}%`} tone={getUtilizationTextColor(row.avg_utilization)} />
                                            <ScopeStat label={t("Overloaded")} value={row.overloaded_count} tone={row.overloaded_count > 0 ? "text-error" : "text-success"} />
                                            <ScopeStat label={t("Switches")} value={row.context_switches} />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                            <span>{row.points_completed} / {row.points_total} {t("points")}</span>
                                            <span>{row.progress}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-success" style={{ width: `${Math.min(100, row.progress)}%` }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="sprints">
                    {loadingSprints ? (
                        <LoadingTile />
                    ) : sprintRows.length === 0 ? (
                        <EmptyState icon={Layers} title={t("No workload data")} description={t("No sprint workload available")} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sprintRows.map((row) => (
                                <Card key={row.sprint_id}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span className="truncate">{row.sprint_name}</span>
                                            <Badge variant={row.sprint_status === "active" ? "success" : row.sprint_status === "completed" ? "outline" : "secondary"}>
                                                {t(row.sprint_status)}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-xs text-text-muted mb-1">{row.project_name}</p>
                                        {row.start_date && row.end_date && (
                                            <p className="text-xs text-text-muted mb-3">{row.start_date} → {row.end_date}</p>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <ScopeStat label={t("Members")} value={row.member_count} />
                                            <ScopeStat label={t("Avg Util.")} value={`${row.avg_utilization}%`} tone={getUtilizationTextColor(row.avg_utilization)} />
                                            <ScopeStat label={t("Overloaded")} value={row.overloaded_count} tone={row.overloaded_count > 0 ? "text-error" : "text-success"} />
                                            <ScopeStat label={t("Switches")} value={row.context_switches} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="teams">
                    {loadingTeams ? (
                        <LoadingTile />
                    ) : teamRows.length === 0 ? (
                        <EmptyState icon={Users} title={t("No workload data")} description={t("No team workload available")} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teamRows.map((row) => (
                                <Card key={row.team_id}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{row.team_name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {row.department && <p className="text-xs text-text-muted mb-3">{row.department}</p>}
                                        <div className="grid grid-cols-2 gap-2">
                                            <ScopeStat label={t("Members")} value={row.member_count} />
                                            <ScopeStat label={t("Avg Util.")} value={`${row.avg_utilization}%`} tone={getUtilizationTextColor(row.avg_utilization)} />
                                            <ScopeStat label={t("Overloaded")} value={row.overloaded_count} tone={row.overloaded_count > 0 ? "text-error" : "text-success"} />
                                            <ScopeStat label={t("Switches")} value={row.context_switches} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="members">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {sprints.map((sprint) => (
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

                    {loadingMembers ? (
                        <LoadingTile />
                    ) : memberRows.length === 0 ? (
                        <EmptyState icon={Users} title={t("No workload")} description={t("No workload entries for this sprint")} />
                    ) : (
                        <>
                            <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={memberTotals.teamSize} /></p><p className="text-xs text-text-muted">{t("Team Size")}</p></CardContent></Card>
                                <Card><CardContent className="p-4 text-center"><p className={cn("text-2xl font-bold", getUtilizationTextColor(memberTotals.avgUtilization))}><AnimatedNumber value={memberTotals.avgUtilization} suffix="%" /></p><p className="text-xs text-text-muted">{t("Avg Utilization")}</p></CardContent></Card>
                                <Card><CardContent className="p-4 text-center"><p className={cn("text-2xl font-bold", memberTotals.overloadedCount > 0 ? "text-error" : "text-success")}>{memberTotals.overloadedCount}</p><p className="text-xs text-text-muted">{t("Overloaded")}</p></CardContent></Card>
                                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={memberTotals.contextSwitches} /></p><p className="text-xs text-text-muted">{t("Context Switches")}</p></CardContent></Card>
                            </div>

                            <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>
                                {t("Team Members")}{memberRows[0]?.sprint_name ? ` — ${memberRows[0].sprint_name}` : ""}
                            </h2>
                            <div className={cn("flex flex-col", compact ? "gap-2 mb-4" : "gap-3 mb-8")}>
                                {memberRows.map((row) => {
                                    const isOverloaded = row.overloaded;
                                    return (
                                        <Card key={`${row.member_id}-${row.sprint_id ?? ""}`}>
                                            <CardContent className={compact ? "p-3" : "p-4"}>
                                                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                                    <div className="flex items-center gap-3 md:w-48 md:shrink-0">
                                                        <Avatar className="h-9 w-9"><AvatarFallback>{row.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-text-dark truncate">{row.member_name}</p>
                                                            <p className="text-xs text-text-muted truncate">{row.role ?? "—"}</p>
                                                        </div>
                                                        {isOverloaded && <Badge variant="error" className="shrink-0 md:hidden"><AlertTriangle className="h-3 w-3 me-1" />{t("Overloaded")}</Badge>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-text-muted">{t("Utilization")}</span>
                                                            <span className={cn("text-xs font-bold", getUtilizationTextColor(row.utilization))}><AnimatedNumber value={row.utilization} suffix="%" /></span>
                                                        </div>
                                                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                                            <div className={cn("h-full rounded-full transition-all duration-500", getUtilizationColor(row.utilization))} style={{ width: `${Math.min(row.utilization, 100)}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 md:flex md:items-center gap-2 md:gap-0">
                                                        <div className="md:w-24 shrink-0 text-center"><p className={cn("text-sm font-bold", isOverloaded ? "text-error" : "text-text-dark")}>{row.assigned}/{row.capacity}</p><p className="text-[10px] md:text-xs text-text-muted">{t("assigned")}/{t("capacity")}</p></div>
                                                        <div className="md:w-20 shrink-0 text-center"><p className="text-sm font-bold text-text-dark">{row.completed}</p><p className="text-[10px] md:text-xs text-text-muted">{t("completed")}</p></div>
                                                        <div className="md:w-20 shrink-0 text-center"><div className="flex items-center justify-center gap-1"><ArrowRightLeft className={cn("h-3 w-3", row.context_switches >= 5 ? "text-error" : "text-text-muted")} /><span className={cn("text-sm font-bold", row.context_switches >= 5 ? "text-error" : "text-text-dark")}>{row.context_switches}</span></div><p className="text-[10px] md:text-xs text-text-muted">{t("switches")}</p></div>
                                                        <div className="md:w-20 shrink-0 text-center"><p className="text-sm font-bold text-text-dark">{row.active_tasks}</p><p className="text-[10px] md:text-xs text-text-muted">{t("active tasks")}</p></div>
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
                                    {memberRows.map((row) => {
                                        const assignedWidth = (row.assigned / maxAssigned) * 100;
                                        const capacityWidth = (row.capacity / maxAssigned) * 100;
                                        return (
                                            <div key={`${row.member_id}-bar`}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{row.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                        <span className="text-xs font-medium text-text-dark">{row.member_name}</span>
                                                    </div>
                                                    <span className={cn("text-xs font-medium", row.overloaded ? "text-error" : "text-text-secondary")}>{row.assigned} / {row.capacity} {t("points")}</span>
                                                </div>
                                                <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                                                    <div className="absolute top-0 h-full border-r-2 border-dashed border-text-muted z-10" style={{ left: `${capacityWidth}%` }} />
                                                    <div className={cn("h-full rounded-full transition-all duration-500", row.overloaded ? "bg-error" : "bg-primary")} style={{ width: `${Math.min(assignedWidth, 100)}%` }} />
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
                                        {sortedByContextSwitches.map((row, index) => {
                                            const maxSwitches = sortedByContextSwitches[0]?.context_switches ?? 1;
                                            const barWidth = maxSwitches > 0 ? (row.context_switches / maxSwitches) * 100 : 0;
                                            const isHigh = row.context_switches >= 5;
                                            return (
                                                <div key={`${row.member_id}-ctx`} className="flex items-center gap-3">
                                                    <span className="text-xs text-text-muted w-5 text-right shrink-0">#{index + 1}</span>
                                                    <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-[8px]">{row.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                    <span className="text-xs font-medium text-text-dark w-32 truncate shrink-0">{row.member_name}</span>
                                                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-500", isHigh ? "bg-error" : "bg-warning")} style={{ width: `${Math.max(barWidth, 4)}%` }} /></div>
                                                    <span className={cn("text-xs font-bold w-6 text-right shrink-0", isHigh ? "text-error" : "text-text-dark")}><AnimatedNumber value={row.context_switches} /></span>
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

const LoadingTile = () => (
    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
        {t("Loading workload...")}
    </div>
);

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
