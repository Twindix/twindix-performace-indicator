import { useState, useMemo, useCallback, type DragEvent } from "react";
import {
    ArrowRight,
    ClipboardList,
    Filter,
    Search,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { TasksSkeleton } from "@/components/skeletons";
import { TaskPhase } from "@/enums";
import type {
    TaskInterface,
    UserInterface,
    BlockerInterface,
} from "@/interfaces";
import { t, useSettings, usePageLoader } from "@/hooks";
import { useSprintStore } from "@/store";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/ui";
import { cn, getStorageItem, setStorageItem, storageKeys } from "@/utils";
import {
    COLUMNS,
    COLUMN_COLORS,
    capitalize,
    phaseLabel,
    inferWorkType,
    checkTransition,
    type TransitionResult,
} from "../../data/seed/constants";
import { BoardView } from "./BoardView";
import { PipelineView } from "./PipelineView";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TransitionDialog } from "./TransitionDialog";



/* -------------------------------------------------------------------------- */
/*  Main View                                                                  */
/* -------------------------------------------------------------------------- */

export const TasksView = () => {
    const isLoading = usePageLoader();
    useSettings();
    const { activeSprintId } = useSprintStore();

    // Initialise tasks — migrate any legacy items missing workType in the initialiser itself (no useEffect needed)
    const [allTasks, setAllTasks] = useState<TaskInterface[]>(() => {
        const stored = getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? [];
        const hasMissing = stored.some((t) => !t.workType);
        if (!hasMissing) return stored;
        const migrated = stored.map((t) => t.workType ? t : { ...t, workType: inferWorkType(t.tags) });
        setStorageItem(storageKeys.tasks, migrated);
        return migrated;
    });

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const blockers = getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? [];

    const [selectedTask, setSelectedTask] = useState<TaskInterface | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"board" | "pipeline">("board");

    const [draggedTask, setDraggedTask] = useState<TaskInterface | null>(null);
    const [dragOverPhase, setDragOverPhase] = useState<TaskPhase | null>(null);

    const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
    const [transitionTask, setTransitionTask] = useState<TaskInterface | null>(null);
    const [transitionTarget, setTransitionTarget] = useState<TaskPhase | null>(null);
    const [transitionResult, setTransitionResult] = useState<TransitionResult | null>(null);

    // ── Derived data ──────────────────────────────────────────────────────────

    const sprintTasks = useMemo(
        () => allTasks.filter((t) => t.sprintId === activeSprintId),
        [allTasks, activeSprintId],
    );

    const filteredTasks = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return sprintTasks.filter((t) =>
            (!q || t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))) &&
            (priorityFilter === "all" || t.priority === priorityFilter) &&
            (assigneeFilter === "all" || t.assigneeId === assigneeFilter),
        );
    }, [sprintTasks, searchQuery, priorityFilter, assigneeFilter]);

    const tasksByPhase = useMemo(() => {
        const map = new Map<TaskPhase, TaskInterface[]>();
        for (const col of COLUMNS) map.set(col.phase, []);
        for (const task of filteredTasks) map.get(task.phase)?.push(task);
        return map;
    }, [filteredTasks]);

    const selectedBlocker = useMemo(
        () => blockers.find((b) => b.id === selectedTask?.blockerId),
        [selectedTask, blockers],
    );

    const selectedMember = useMemo(
        () => members.find((m) => m.id === selectedTask?.assigneeId),
        [selectedTask, members],
    );

    const sprintAssigneeIds = useMemo(
        () => [...new Set(sprintTasks.map((t) => t.assigneeId))],
        [sprintTasks],
    );

    const totalPoints = sprintTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const donePoints  = sprintTasks.filter((t) => t.phase === COLUMNS[COLUMNS.length - 1].phase).reduce((sum, t) => sum + t.storyPoints, 0);
    const blockedCount = sprintTasks.filter((t) => t.hasBlocker).length;

    // ── Mutations ─────────────────────────────────────────────────────────────

    const updateTasks = useCallback((updater: (prev: TaskInterface[]) => TaskInterface[]) => {
        setAllTasks((prev) => {
            const next = updater(prev);
            setStorageItem(storageKeys.tasks, next);
            return next;
        });
    }, []);

    const updateTaskField = useCallback((taskId: string, field: keyof TaskInterface, value: any) => {
        updateTasks((prev) => prev.map((t) =>
            t.id === taskId ? { ...t, [field]: value, updatedAt: new Date().toISOString().split("T")[0] } : t,
        ));
    }, [updateTasks]);

    // ── Transition flow ───────────────────────────────────────────────────────

    const requestTransition = useCallback((task: TaskInterface, targetPhase: TaskPhase) => {
        if (task.phase === targetPhase) return;
        setTransitionTask(task);
        setTransitionTarget(targetPhase);
        setTransitionResult(checkTransition(task, targetPhase, blockers));
        setTransitionDialogOpen(true);
    }, [blockers]);

    const confirmTransition = useCallback(() => {
        if (!transitionTask || !transitionTarget) return;
        updateTaskField(transitionTask.id, "phase", transitionTarget);
        toast.success(`${t("Task moved")}: ${t(phaseLabel(transitionTask.phase))} → ${t(phaseLabel(transitionTarget))}`, {
            description: transitionTask.title,
        });
        setTransitionDialogOpen(false);
        setTransitionTask(null);
        setTransitionTarget(null);
        setTransitionResult(null);
    }, [transitionTask, transitionTarget, updateTaskField, t]);

    // ── Drag handlers ─────────────────────────────────────────────────────────

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

    // ── Render ────────────────────────────────────────────────────────────────

    if (isLoading) return <TasksSkeleton />;

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

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
                            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                            <Input placeholder={t("Search tasks or tags...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingInlineStart: 40 }} />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Priority")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Priorities")}</SelectItem>
                                    {(["critical", "high", "medium", "low"] as const).map((p) => (
                                        <SelectItem key={p} value={p}>{t(capitalize(p))}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Assignee")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Assignees")}</SelectItem>
                                    {sprintAssigneeIds.map((id) => {
                                        const m = members.find((mem) => mem.id === id);
                                        return <SelectItem key={id} value={id}>{m?.name ?? id}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
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

            {/* Phase legend */}
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
                    members={members}
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
                member={selectedMember}
                blocker={selectedBlocker}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onMoveRequest={requestTransition}
            />

            <TransitionDialog
                open={transitionDialogOpen}
                onOpenChange={setTransitionDialogOpen}
                task={transitionTask}
                targetPhase={transitionTarget}
                transitionResult={transitionResult}
                onConfirm={confirmTransition}
            />
        </div>
    );
};
