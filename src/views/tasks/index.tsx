import { useState, useMemo, useCallback, useEffect, type DragEvent } from "react";
import {
    ArrowRight,
    ClipboardList,
    Filter,
    Plus,
    Search,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { TasksSkeleton } from "@/components/skeletons";
import { TaskPhase, TaskPriority } from "@/enums";
import type {
    TaskInterface,
    UserInterface,
    BlockerInterface,
} from "@/interfaces";
import { t, useSettings, usePageLoader } from "@/hooks";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";
import { useSprintStore } from "@/store";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/ui";
import { cn, getStorageItem, storageKeys } from "@/utils";
import { tasksConstants } from "@/constants/tasks";
import {
    COLUMNS,
    COLUMN_COLORS,
    checkTransition,
    type TransitionResult,
} from "../../data/seed/constants";
import { BoardView } from "./BoardView";
import { PipelineView } from "./PipelineView";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TransitionDialog } from "./TransitionDialog";
import { AddTaskDialog } from "./add-task-dialog";

/* -------------------------------------------------------------------------- */
/*  Main View                                                                  */
/* -------------------------------------------------------------------------- */

export const TasksView = () => {
    const isLoading = usePageLoader();
    useSettings();
    const { activeSprintId } = useSprintStore();

    const [allTasks, setAllTasks] = useState<TaskInterface[]>([]);
    const [isFetchingTasks, setIsFetchingTasks] = useState(false);

    useEffect(() => {
        if (!activeSprintId) return;
        setIsFetchingTasks(true);
        tasksService.listHandler(activeSprintId)
            .then((res) => setAllTasks(res.data))
            .catch((err) => toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed)))
            .finally(() => setIsFetchingTasks(false));
    }, [activeSprintId]);

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const blockers = getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? [];

    const [selectedTask, setSelectedTask] = useState<TaskInterface | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [phaseFilter, setPhaseFilter] = useState<string>("all");
    const [readinessFilter, setReadinessFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"board" | "pipeline">("board");

    const [draggedTask, setDraggedTask] = useState<TaskInterface | null>(null);
    const [dragOverPhase, setDragOverPhase] = useState<TaskPhase | null>(null);

    const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
    const [transitionTask, setTransitionTask] = useState<TaskInterface | null>(null);
    const [transitionTarget, setTransitionTarget] = useState<TaskPhase | null>(null);
    const [transitionResult, setTransitionResult] = useState<TransitionResult | null>(null);

    const sprintTasks = useMemo(
        () => allTasks.filter((t) => t.sprintId === activeSprintId),
        [allTasks, activeSprintId],
    );

    const filteredTasks = useMemo(() => {
        let result = sprintTasks;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((t) => t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)));
        }
        if (phaseFilter !== "all") {
            if (phaseFilter === "blocked") result = result.filter((t) => t.hasBlocker);
            else result = result.filter((t) => t.phase === phaseFilter);
        }
        if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
        if (assigneeFilter !== "all") result = result.filter((t) => (t.assigneeIds ?? []).includes(assigneeFilter));
        if (readinessFilter === "ready") result = result.filter((t) => t.readinessScore >= 70);
        if (readinessFilter === "not_ready") result = result.filter((t) => t.readinessScore < 70);
        if (typeFilter !== "all") result = result.filter((t) => (t.type ?? "feature") === typeFilter);
        return result;
    }, [sprintTasks, searchQuery, phaseFilter, priorityFilter, assigneeFilter, readinessFilter, typeFilter]);

    const tasksByPhase = useMemo(() => {
        const map = new Map<TaskPhase, TaskInterface[]>();
        for (const col of COLUMNS) map.set(col.phase, []);
        for (const task of filteredTasks) map.get(task.phase)?.push(task);
        return map;
    }, [filteredTasks]);

    const sprintAssigneeIds = useMemo(
        () => [...new Set(sprintTasks.flatMap((t) => t.assigneeIds ?? []))],
        [sprintTasks],
    );

    const totalPoints = sprintTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const donePoints = sprintTasks.filter((t) => t.phase === TaskPhase.Done).reduce((sum, t) => sum + t.storyPoints, 0);
    const blockedCount = sprintTasks.filter((t) => t.hasBlocker).length;

    const handleAddTask = useCallback((task: TaskInterface) => {
        setAllTasks((prev) => [...prev, task]);
    }, []);

    const moveTask = useCallback((taskId: string, newPhase: TaskPhase, extraProps?: Partial<TaskInterface>) => {
        setAllTasks((prev) => prev.map((t) =>
            t.id === taskId ? { ...t, phase: newPhase, updatedAt: new Date().toISOString().split("T")[0], ...extraProps } : t,
        ));
    }, []);

    const requestTransition = useCallback((task: TaskInterface, targetPhase: TaskPhase) => {
        if (task.phase === targetPhase) return;
        setTransitionTask(task);
        setTransitionTarget(targetPhase);
        setTransitionResult(checkTransition(task, targetPhase, blockers));
        setTransitionDialogOpen(true);
    }, [blockers]);

    const confirmTransition = useCallback(async (payload?: { loggedHours?: number; note?: string }) => {
        if (!transitionTask || !transitionTarget) return;

        try {
            const response = await tasksService.updateHandler(transitionTask.id, { phase: transitionTarget });
            moveTask(transitionTask.id, transitionTarget, response.data);
            toast_success(transitionTask, transitionTarget);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.statusUpdateFailed));
        } finally {
            setTransitionDialogOpen(false);
            setTransitionTask(null);
            setTransitionTarget(null);
            setTransitionResult(null);
        }
    }, [transitionTask, transitionTarget, moveTask]);

    const handleDragStart  = useCallback((_e: DragEvent<HTMLDivElement>, task: TaskInterface) => setDraggedTask(task), []);
    const handleDragOver   = useCallback((e: DragEvent<HTMLDivElement>) => e.preventDefault(), []);
    const handleDragEnter  = useCallback((_e: DragEvent<HTMLDivElement>, phase: TaskPhase) => setDragOverPhase(phase), []);
    const handleDragLeave  = useCallback((e: DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverPhase(null);
    }, []);
    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetPhase: TaskPhase) => {
        e.preventDefault();
        setDragOverPhase(null);
        if (draggedTask && draggedTask.phase !== targetPhase) requestTransition(draggedTask, targetPhase);
        setDraggedTask(null);
    }, [draggedTask, requestTransition]);

    const handleUpdateAttachments = useCallback((taskId: string, attachments: TaskInterface["attachments"]) => {
        setAllTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, attachments } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, attachments } : prev);
    }, []);

    const handleUpdateComments = useCallback((taskId: string, comments: TaskInterface["comments"]) => {
        setAllTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, comments } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, comments } : prev);
    }, []);

    const handleUpdateTimeLogs = useCallback((taskId: string, timeLogs: TaskInterface["timeLogs"]) => {
        setAllTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, timeLogs } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, timeLogs } : prev);
    }, []);

    const handleUpdateRequirements = useCallback((taskId: string, requirements: TaskInterface["requirements"]) => {
        setAllTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, requirements } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, requirements } : prev);
    }, []);

    const selectedBlocker = useMemo(() => {
        if (!selectedTask?.blockerId) return undefined;
        return blockers.find((b) => b.id === selectedTask.blockerId);
    }, [selectedTask, blockers]);

    if (isLoading || isFetchingTasks) return <TasksSkeleton />;

    return (
        <div>
            <Header
                title={t("Task Management")}
                description={t("Drag tasks between columns to change their phase. Phase gates enforce readiness criteria.")}
                actions={
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span><strong className="text-text-dark">{sprintTasks.length}</strong> {t("tasks")}</span>
                        <span className="text-border">|</span>
                        <span><strong className="text-text-dark">{donePoints}</strong>/{totalPoints} {t("points")}</span>
                        {blockedCount > 0 && (
                            <>
                                <span className="text-border">|</span>
                                <Badge variant="error">{blockedCount} {t("blocked")}</Badge>
                            </>
                        )}
                    </div>
                }
            />

            <Card className="mb-6">
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
                            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                            <Input placeholder={t("Search tasks or tags...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingInlineStart: 40 }} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-text-muted hidden sm:block shrink-0" />

                            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Status")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                    <SelectItem value={TaskPhase.Backlog}>{t("Backlog")}</SelectItem>
                                    <SelectItem value={TaskPhase.Ready}>{t("Ready")}</SelectItem>
                                    <SelectItem value={TaskPhase.InProgress}>{t("In Progress")}</SelectItem>
                                    <SelectItem value={TaskPhase.Review}>{t("Review")}</SelectItem>
                                    <SelectItem value={TaskPhase.QA}>{t("Ready for Testing")}</SelectItem>
                                    <SelectItem value={TaskPhase.Done}>{t("Deployed")}</SelectItem>
                                    <SelectItem value="blocked">{t("Blocked")}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Assignee")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Assignees")}</SelectItem>
                                    {sprintAssigneeIds.map((id) => {
                                        const m = members.find((mem) => mem.id === id);
                                        return <SelectItem key={id} value={id}>{m?.name ?? id}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>

                            <Select value={readinessFilter} onValueChange={setReadinessFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Readiness")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Readiness")}</SelectItem>
                                    <SelectItem value="ready">{t("Ready (≥70%)")}</SelectItem>
                                    <SelectItem value="not_ready">{t("Not Ready (<70%)")}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Priority")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Priorities")}</SelectItem>
                                    <SelectItem value={TaskPriority.Low}>{t("Low")}</SelectItem>
                                    <SelectItem value={TaskPriority.Medium}>{t("Medium")}</SelectItem>
                                    <SelectItem value={TaskPriority.High}>{t("High")}</SelectItem>
                                    <SelectItem value={TaskPriority.Critical}>{t("Critical")}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[120px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Type")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Types")}</SelectItem>
                                    <SelectItem value="feature">{t("Feature")}</SelectItem>
                                    <SelectItem value="bug">{t("Bug")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {(phaseFilter !== "all" || assigneeFilter !== "all" || readinessFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all" || searchQuery) && (
                                <button
                                    onClick={() => { setPhaseFilter("all"); setAssigneeFilter("all"); setReadinessFilter("all"); setPriorityFilter("all"); setTypeFilter("all"); setSearchQuery(""); }}
                                    className="text-xs text-text-muted hover:text-text-dark underline cursor-pointer"
                                >
                                    {t("Clear all")}
                                </button>
                            )}
                            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setAddTaskDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                                {t("Add Task")}
                            </Button>
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

            <div className="flex flex-wrap items-center gap-1.5 mb-6 mt-1 py-2 text-[10px] text-text-muted">
                {COLUMNS.map((col, i) => (
                    <span key={col.phase} className="flex items-center gap-1">
                        {i > 0 && <ArrowRight className="h-3 w-3 mx-0.5" />}
                        <span className={cn("h-2 w-2 rounded-full", COLUMN_COLORS[col.phase])} />
                        <span className="font-medium">{t(col.label)}</span>
                    </span>
                ))}
            </div>

            {filteredTasks.length === 0 ? (
                <EmptyState icon={ClipboardList} title={t("No tasks found")} description={t("Try adjusting your filters or search query.")} />
            ) : viewMode === "board" ? (
                <BoardView
                    tasksByPhase={tasksByPhase}
                    draggedTask={draggedTask}
                    dragOverPhase={dragOverPhase}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDragEnter={handleDragEnter}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    setSelectedTask={setSelectedTask}
                    setDialogOpen={setDialogOpen}
                />
            ) : (
                <PipelineView
                    tasks={filteredTasks}
                    members={members}
                    setSelectedTask={setSelectedTask}
                    setDialogOpen={setDialogOpen}
                />
            )}

            <TaskDetailDialog
                task={selectedTask}
                members={members}
                blocker={selectedBlocker}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onMoveRequest={requestTransition}
                onUpdateComments={handleUpdateComments}
                onUpdateAttachments={handleUpdateAttachments}
                onUpdateTimeLogs={handleUpdateTimeLogs}
                onUpdateRequirements={handleUpdateRequirements}
            />

            <TransitionDialog
                open={transitionDialogOpen}
                onOpenChange={setTransitionDialogOpen}
                task={transitionTask}
                targetPhase={transitionTarget}
                transitionResult={transitionResult}
                isAssignee={(transitionTask?.assigneeIds ?? []).includes(getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "")}
                onConfirm={confirmTransition}
            />

            <AddTaskDialog
                open={addTaskDialogOpen}
                onOpenChange={setAddTaskDialogOpen}
                members={members}
                sprintId={activeSprintId ?? ""}
                onAddTask={handleAddTask}
            />
        </div>
    );
};

// helper to avoid importing toast at top level (toast is already imported in sub-files)
function toast_success(task: TaskInterface, targetPhase: TaskPhase) {
    const toLabel = COLUMNS.find((c) => c.phase === targetPhase)?.label ?? targetPhase;
    const fromLabel = COLUMNS.find((c) => c.phase === task.phase)?.label ?? task.phase;
    // fire-and-forget — import toast lazily to avoid circular issues
    import("sonner").then(({ toast }) => {
        toast.success(`${t("Task moved")}: ${t(fromLabel)} → ${t(toLabel)}`, { description: task.title });
    });
}
