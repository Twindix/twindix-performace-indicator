import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, Filter, Plus, Search } from "lucide-react";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { TasksSkeleton } from "@/components/skeletons";
import { TaskPhase, TaskPriority } from "@/enums";
import type { TaskInterface, TaskStatsInterface } from "@/interfaces";
import { t, useTasksList, usePipeline, usePermissions, useTaskStats, useUpdateTaskStatus, useUsersListLite, useGetTask } from "@/hooks";
import { useAuthStore, useSprintStore } from "@/store";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/ui";
import { BoardView } from "./BoardView";
import { PipelineView } from "./PipelineView";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { AddTaskDialog } from "./add-task-dialog";
import { TransitionDialog } from "./TransitionDialog";

export const TasksView = () => <TasksViewInner />;

const TasksViewInner = () => {
    const { activeSprintId } = useSprintStore();
    const p = usePermissions();

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(id);
    }, [searchQuery]);
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [assigneeFilter, setAssigneeFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"board" | "pipeline">("board");

    const {
        tasks,
        isLoading: tasksLoading,
        patchTaskLocal,
        removeTaskLocal,
        addTaskLocal,
        toKanban,
        refetch,
    } = useTasksList(activeSprintId, {
        status: statusFilter !== "all" && statusFilter !== "blocked" ? statusFilter : undefined,
        assigned_to: assigneeFilter !== "all" ? assigneeFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: debouncedSearch || undefined,
    });

    const { pipeline, isLoading: pipelineLoading } = usePipeline(activeSprintId);
    const { statsHandler } = useTaskStats();
    const { updateStatusHandler, isLoading: isUpdatingStatus } = useUpdateTaskStatus();
    const { getHandler: getTaskHandler } = useGetTask();
    const { users } = useUsersListLite();
    const { user: currentUser } = useAuthStore();

    const [stats, setStats] = useState<TaskStatsInterface | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskInterface | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);

    const [transitionOpen, setTransitionOpen] = useState(false);
    const [transitionTask, setTransitionTask] = useState<TaskInterface | null>(null);
    const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

    const openTransition = useCallback((task: TaskInterface, targetPhase: TaskPhase) => {
        setTransitionTask(task);
        setTransitionTarget(targetPhase);
        setTransitionOpen(true);
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();
    const queryTaskId = searchParams.get("taskId");
    useEffect(() => {
        if (!queryTaskId) return;
        getTaskHandler(queryTaskId).then((res) => {
            if (res) {
                setSelectedTask(res as TaskInterface);
                setDialogOpen(true);
            }
            setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete("taskId"); return next; }, { replace: true });
        });
    }, [queryTaskId, getTaskHandler, setSearchParams]);

    const confirmTransition = useCallback(async () => {
        if (!transitionTask || !transitionTarget) return;
        const ok = await updateStatusHandler(transitionTask.id, transitionTarget);
        if (ok) {
            const fresh = await getTaskHandler(transitionTask.id);
            if (fresh) {
                patchTaskLocal(fresh);
                setSelectedTask((prev) => (prev && prev.id === fresh.id ? fresh : prev));
            }
            setTransitionOpen(false);
            setTransitionTask(null);
            setTransitionTarget(null);
        }
    }, [transitionTask, transitionTarget, updateStatusHandler, getTaskHandler, patchTaskLocal]);

    useEffect(() => {
        if (!activeSprintId) return;
        statsHandler(activeSprintId).then((res) => { if (res) setStats(res); });
    }, [activeSprintId, statsHandler]);

    useEffect(() => {
        if (!dialogOpen || !selectedTask) return;
        getTaskHandler(selectedTask.id).then((res) => {
            if (res) {
                setSelectedTask(res);
                patchTaskLocal(res);
            }
        });
    }, [dialogOpen, selectedTask?.id]);

    const kanban = useMemo(() => {
        const board = toKanban();
        if (statusFilter === "blocked") {
            for (const col of Object.keys(board)) {
                board[col] = board[col].filter((t) => t.is_blocked);
            }
        }
        return board;
    }, [toKanban, statusFilter]);

    const filteredPipeline = useMemo(() => {
        if (statusFilter === "blocked") {
            const result = { ...pipeline };
            for (const col of Object.keys(result)) {
                result[col] = result[col].filter((t) => t.is_blocked);
            }
            return result;
        }
        return pipeline;
    }, [pipeline, statusFilter]);

    const filteredCount = viewMode === "board"
        ? Object.values(kanban).reduce((sum, arr) => sum + arr.length, 0)
        : Object.values(filteredPipeline).reduce((sum, arr) => sum + arr.length, 0);

    const isLoading = tasksLoading || (viewMode === "pipeline" && pipelineLoading);
    const totalTasks = stats?.total_tasks ?? tasks.length;
    const donePoints = stats?.story_points.used ?? 0;
    const totalPoints = stats?.story_points.total ?? 0;
    const blockedCount = stats?.blocked_count ?? tasks.filter((t) => t.is_blocked).length;

    if (isLoading && tasks.length === 0) return <TasksSkeleton />;

    return (
        <div>
            <Header
                title={t("Task Management")}
                description={t("Use the task detail dialog to move tasks between phases.")}
                actions={
                    tasks.length === 0 && !searchQuery && statusFilter === "all" && priorityFilter === "all" && assigneeFilter === "all" && typeFilter === "all" ? (
                        p.tasks.create() ? (
                            <Button size="sm" className="gap-1.5" onClick={() => setAddTaskDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                                {t("Add Task")}
                            </Button>
                        ) : null
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <span><strong className="text-text-dark">{totalTasks}</strong> {t("tasks")}</span>
                            <span className="text-border">|</span>
                            <span><strong className="text-text-dark">{donePoints}</strong>/{totalPoints} {t("pts")}</span>
                            {blockedCount > 0 && (
                                <>
                                    <span className="text-border">|</span>
                                    <Badge variant="error">{blockedCount} {t("blocked")}</Badge>
                                </>
                            )}
                        </div>
                    )
                }
            />

            <Card className="mb-6">
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
                            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                            <Input
                                placeholder={t("Search tasks or tags...")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingInlineStart: 40 }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-text-muted hidden sm:block shrink-0" />

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm">
                                    <SelectValue placeholder={t("Status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                    <SelectItem value="backlog">{t("Backlog")}</SelectItem>
                                    <SelectItem value="ready">{t("Ready")}</SelectItem>
                                    <SelectItem value="in_progress">{t("In Progress")}</SelectItem>
                                    <SelectItem value="review">{t("Review")}</SelectItem>
                                    <SelectItem value="qa">{t("QA")}</SelectItem>
                                    <SelectItem value="done">{t("Done")}</SelectItem>
                                    <SelectItem value="blocked">{t("Blocked")}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px] h-9 text-xs sm:text-sm">
                                    <SelectValue placeholder={t("Priority")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Priorities")}</SelectItem>
                                    <SelectItem value={TaskPriority.Low}>{t("Low")}</SelectItem>
                                    <SelectItem value={TaskPriority.Medium}>{t("Medium")}</SelectItem>
                                    <SelectItem value={TaskPriority.High}>{t("High")}</SelectItem>
                                    <SelectItem value={TaskPriority.Critical}>{t("Critical")}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm">
                                    <SelectValue placeholder={t("Assignee")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Assignees")}</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[120px] h-9 text-xs sm:text-sm">
                                    <SelectValue placeholder={t("Type")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Types")}</SelectItem>
                                    <SelectItem value="feature">{t("Feature")}</SelectItem>
                                    <SelectItem value="bug">{t("Bug")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {(statusFilter !== "all" || assigneeFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all" || searchQuery) && (
                                <button
                                    onClick={() => { setStatusFilter("all"); setAssigneeFilter("all"); setPriorityFilter("all"); setTypeFilter("all"); setSearchQuery(""); }}
                                    className="text-xs text-text-muted hover:text-text-dark underline cursor-pointer"
                                >
                                    {t("Clear all")}
                                </button>
                            )}

                            {p.tasks.create() && (
                                <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setAddTaskDialogOpen(true)}>
                                    <Plus className="h-4 w-4" />
                                    {t("Add Task")}
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center bg-muted p-1 rounded-lg ml-auto">
                            <Button variant={viewMode === "board" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("board")} className="h-7 text-xs px-3">
                                {t("Kanban")}
                            </Button>
                            <Button variant={viewMode === "pipeline" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("pipeline")} className="h-7 text-xs px-3">
                                {t("Pipeline")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredCount === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title={t("No tasks found")}
                    description={t("Try adjusting your filters or search query.")}
                />
            ) : viewMode === "board" ? (
                <BoardView
                    kanban={kanban}
                    setSelectedTask={setSelectedTask}
                    setDialogOpen={setDialogOpen}
                />
            ) : (
                <PipelineView
                    pipeline={filteredPipeline}
                    members={users}
                    setSelectedTask={setSelectedTask}
                    setDialogOpen={setDialogOpen}
                />
            )}

            <TaskDetailDialog
                task={selectedTask}
                members={users}
                blocker={undefined}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onMoveRequest={(task, targetPhase) => { setDialogOpen(false); openTransition(task, targetPhase); }}
                onUpdateRequirements={() => {}}
                patchTaskLocal={(id, updates) => {
                    const existing = tasks.find((t) => t.id === id);
                    if (!existing) return;
                    const merged = { ...existing, ...updates };
                    patchTaskLocal(merged);
                    setSelectedTask((prev) => (prev && prev.id === id ? merged : prev));
                }}
                removeTaskLocal={removeTaskLocal}
            />

            <AddTaskDialog
                open={addTaskDialogOpen}
                onOpenChange={(open) => {
                    setAddTaskDialogOpen(open);
                    if (!open) refetch();
                }}
                members={users}
                sprintId={activeSprintId}
                addTaskLocal={addTaskLocal}
            />

            <TransitionDialog
                open={transitionOpen}
                onOpenChange={(open) => { setTransitionOpen(open); if (!open) { setTransitionTask(null); setTransitionTarget(null); } }}
                task={transitionTask}
                targetPhase={transitionTarget as TaskPhase | null}
                onConfirm={confirmTransition}
                isAssignee={Boolean(transitionTask && currentUser && (transitionTask.assignee?.id === currentUser.id))}
                isSubmitting={isUpdatingStatus}
            />
        </div>
    );
};
