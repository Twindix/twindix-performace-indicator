import { useEffect, useState } from "react";
import { Download, FolderKanban, Layers, User } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import {
    t,
    usePermissions,
    useProjectsListLite,
    useSprintsList,
    useUsersListLite,
    useWorkloadByProject,
    useWorkloadBySprint,
    useWorkloadByUser,
} from "@/hooks";
import { useSprintStore } from "@/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import { cn, downloadCsv } from "@/utils";

const CSV_COLS = ["Member Name", "Total Tasks", "Completed Tasks", "In Progress", "Blocked", "Story Points Done", "Story Points Total", "Logged Hours", "Task Completion %", "Story Point %"] as const;

const rowsToCsv = (rows: WorkloadUserRowInterface[]) =>
    rows.map((r) => [
        r.user.name,
        r.total_tasks,
        r.completed_tasks,
        r.in_progress_tasks,
        r.blocked_tasks,
        r.completed_story_points,
        r.total_story_points,
        r.logged_hours,
        r.total_tasks > 0 ? Math.round((r.completed_tasks / r.total_tasks) * 100) : 0,
        r.total_story_points > 0 ? Math.round((r.completed_story_points / r.total_story_points) * 100) : 0,
    ]);

export const WorkloadView = () => {
    const p = usePermissions();
    const canDownload = p.reports.downloadCSV();
    const [scope, setScope] = useState<"sprint" | "project" | "user">("sprint");
    const { activeSprintId } = useSprintStore();
    const { sprints } = useSprintsList();
    const { projects } = useProjectsListLite();
    const { users } = useUsersListLite();

    const [selectedSprintId, setSelectedSprintId] = useState<string>(activeSprintId ?? "");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    useEffect(() => {
        if (selectedProjectId === "" && projects.length > 0) setSelectedProjectId(projects[0].id);
    }, [projects, selectedProjectId]);

    useEffect(() => {
        if (selectedUserId === "" && users.length > 0) setSelectedUserId(users[0].id);
    }, [users, selectedUserId]);

    const { rows: sprintRows, isLoading: loadingSprint } = useWorkloadBySprint(selectedSprintId);
    const { rows: projectRows, isLoading: loadingProject } = useWorkloadByProject(selectedProjectId);
    const { rows: userRows, isLoading: loadingUser } = useWorkloadByUser(selectedUserId);

    const handleDownload = () => {
        if (scope === "sprint") {
            const name = sprints.find((s) => s.id === selectedSprintId)?.name ?? selectedSprintId;
            downloadCsv(`workload-sprint-${name}.csv`, [CSV_COLS as unknown as string[], ...rowsToCsv(sprintRows)]);
        } else if (scope === "project") {
            const name = projects.find((p) => p.id === selectedProjectId)?.name ?? selectedProjectId;
            downloadCsv(`workload-project-${name}.csv`, [CSV_COLS as unknown as string[], ...rowsToCsv(projectRows)]);
        } else {
            const user = users.find((u) => u.id === selectedUserId);
            const name = user?.full_name ?? selectedUserId;
            downloadCsv(`workload-user-${name}.csv`, [CSV_COLS as unknown as string[], ...rowsToCsv(userRows)]);
        }
    };

    const activeRows = scope === "sprint" ? sprintRows : scope === "project" ? projectRows : userRows;

    return (
        <div>
            <Header
                title={t("Team Workload")}
                description={t("Track capacity across sprints, projects, and users.")}
                actions={canDownload && activeRows.length > 0 ? (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                        {t("Download CSV")}
                    </Button>
                ) : null}
            />

            <Tabs value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                <TabsList className="mb-6">
                    <TabsTrigger value="sprint"><Layers className="h-4 w-4 me-1.5" />{t("By Sprint")}</TabsTrigger>
                    <TabsTrigger value="project"><FolderKanban className="h-4 w-4 me-1.5" />{t("By Project")}</TabsTrigger>
                    <TabsTrigger value="user"><User className="h-4 w-4 me-1.5" />{t("By User")}</TabsTrigger>
                </TabsList>

                <TabsContent value="sprint">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {sprints.map((sprint) => (
                            <button
                                key={sprint.id}
                                type="button"
                                onClick={() => setSelectedSprintId(sprint.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    selectedSprintId === sprint.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {sprint.name}
                            </button>
                        ))}
                    </div>
                    {loadingSprint ? <LoadingTile /> : sprintRows.length === 0 ? (
                        <EmptyState icon={Layers} title={t("No workload data")} description={t("No sprint workload available")} />
                    ) : (
                        <UserRowGrid rows={sprintRows} />
                    )}
                </TabsContent>

                <TabsContent value="project">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => setSelectedProjectId(project.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    selectedProjectId === project.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {project.name}
                            </button>
                        ))}
                    </div>
                    {loadingProject ? <LoadingTile /> : projectRows.length === 0 ? (
                        <EmptyState icon={FolderKanban} title={t("No workload data")} description={t("Select a project to view workload")} />
                    ) : (
                        <UserRowGrid rows={projectRows} />
                    )}
                </TabsContent>

                <TabsContent value="user">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {users.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => setSelectedUserId(u.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    selectedUserId === u.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {u.full_name}
                            </button>
                        ))}
                    </div>
                    {loadingUser ? <LoadingTile /> : userRows.length === 0 ? (
                        <EmptyState icon={User} title={t("No workload data")} description={t("Select a user to view workload")} />
                    ) : (
                        <UserRowGrid rows={userRows} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

import type { WorkloadUserRowInterface } from "@/interfaces";

const UserRowGrid = ({ rows }: { rows: WorkloadUserRowInterface[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((row) => {
            const completionRate = row.total_tasks > 0
                ? Math.round((row.completed_tasks / row.total_tasks) * 100)
                : 0;
            const storyPtRate = row.total_story_points > 0
                ? Math.round((row.completed_story_points / row.total_story_points) * 100)
                : 0;
            return (
                <Card key={row.user.id}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base truncate">{row.user.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 grid grid-cols-2 gap-2">
                        <WorkloadStat label={t("Total Tasks")} value={row.total_tasks} />
                        <WorkloadStat label={t("Completed")} value={row.completed_tasks} tone="text-success" />
                        <WorkloadStat label={t("In Progress")} value={row.in_progress_tasks} tone="text-primary-medium" />
                        <WorkloadStat label={t("Blocked")} value={row.blocked_tasks} tone={row.blocked_tasks > 0 ? "text-error" : undefined} />
                        <WorkloadStat label={t("Story Points")} value={`${row.completed_story_points}/${row.total_story_points}`} />
                        <WorkloadStat label={t("Logged Hours")} value={`${row.logged_hours}h`} />
                        <div className="col-span-2">
                            <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                <span>{t("Task completion")}</span>
                                <span>{completionRate}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-success" style={{ width: `${completionRate}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-text-muted mb-1 mt-2">
                                <span>{t("Story point completion")}</span>
                                <span>{storyPtRate}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${storyPtRate}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        })}
    </div>
);

const WorkloadStat = ({ label, value, tone }: { label: string; value: string | number; tone?: string }) => (
    <div className="rounded-md bg-muted/40 px-2 py-1.5">
        <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className={cn("text-sm font-bold", tone ?? "text-text-dark")}>
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
    </div>
);

const LoadingTile = () => (
    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
        {t("Loading workload...")}
    </div>
);
