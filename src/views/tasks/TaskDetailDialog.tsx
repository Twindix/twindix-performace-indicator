import { useEffect, useState } from "react";
import { Activity, AlertCircle, ArrowRight, CheckCircle2, Circle, ClipboardList, Flag, Layers, ListChecks, Pencil, Plus, Tag, Trash2, User, X } from "lucide-react";

import { Badge, Button, Input, Skeleton } from "@/atoms";
import { BlockerStatus, TaskPriority, TaskPhase } from "@/enums";
import { t, useCreateRequirement, useDeleteRequirement, useDeleteTask, useGetRequirement, useMarkTaskComplete, useTaskTags, useToggleRequirement, useUpdateRequirement } from "@/hooks";
import type { TaskInterface, UserLiteInterface, BlockerInterface, RequirementInterface } from "@/interfaces";
import { Avatar, AvatarFallback, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";
import { cn, formatDate } from "@/utils";
import { useAuthStore } from "@/store";
import { TaskAttachments } from "./TaskAttachments";
import { TaskTimeLogs } from "./TaskTimeLogs";
import { TaskComments } from "./TaskComments";

const COLUMNS = [
    { status: "backlog", label: "Backlog" },
    { status: "ready", label: "Ready" },
    { status: "in_progress", label: "In Progress" },
    { status: "review", label: "Review" },
    { status: "qa", label: "QA" },
    { status: "done", label: "Done" },
] as const;

const COLUMN_COLORS: Record<string, string> = {
    backlog: "bg-text-muted",
    ready: "bg-primary",
    in_progress: "bg-warning",
    review: "bg-[#8b5cf6]",
    qa: "bg-[#ec4899]",
    done: "bg-success",
};

const PRIORITY_VARIANT: Record<string, "error" | "warning" | "default" | "secondary"> = {
    critical: "error",
    high: "warning",
    medium: "default",
    low: "secondary",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const statusLabel = (status: string) => status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export interface TaskDetailDialogProps {
    task: TaskInterface | null;
    members: UserLiteInterface[];
    blocker: BlockerInterface | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
    onUpdateRequirements?: (taskId: string, requirements: RequirementInterface[]) => void;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
    removeTaskLocal: (id: string) => void;
}

export const TaskDetailDialog = ({
    task,
    members,
    blocker,
    open,
    onOpenChange,
    onMoveRequest,
    patchTaskLocal,
    removeTaskLocal,
}: TaskDetailDialogProps) => {
    const { deleteHandler: deleteTaskHandler, isLoading: isDeletingTask } = useDeleteTask();
    const { markCompleteHandler, isLoading: isMarkingComplete } = useMarkTaskComplete();
    const { addHandler: addTagHandler, removeHandler: removeTagHandler } = useTaskTags();
    const { getAllHandler: getRequirementsHandler } = useGetRequirement();
    const { createHandler: createRequirementHandler, isLoading: isAddingReq } = useCreateRequirement();
    const { toggleHandler: toggleRequirementHandler } = useToggleRequirement();
    const { updateHandler: updateRequirementHandler } = useUpdateRequirement();
    const { deleteHandler: deleteRequirementHandler } = useDeleteRequirement();

    const { user: authUser } = useAuthStore();
    const currentUserId = authUser?.id ?? "";

    const [editingReqId, setEditingReqId] = useState<string | null>(null);
    const [editingReqLabel, setEditingReqLabel] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [showTagInput, setShowTagInput] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [reqInput, setReqInput] = useState("");
    const [showReqInput, setShowReqInput] = useState(false);
    const [isFetchingReqs, setIsFetchingReqs] = useState(false);

    useEffect(() => {
        if (!open || !task) return;
        setIsFetchingReqs(true);
        getRequirementsHandler(task.id).then((res) => {
            if (res) patchTaskLocal(task.id, { requirements: res });
            setIsFetchingReqs(false);
        });
    }, [open, task?.id, getRequirementsHandler]);

    if (!task) return null;

    const nextStatus = task.phase_navigation?.next ?? null;
    const nextLabel = nextStatus
        ? (COLUMNS.find((c) => c.status === nextStatus)?.label ?? nextStatus.replace(/_/g, " "))
        : null;
    const taskRequirements = task.requirements ?? [];
    const allReqsApproved = taskRequirements.length > 0 && taskRequirements.every((r) => r.is_done);
    const isAssignee = !!authUser && task.assignee?.id === authUser.id;
    const isManager = authUser?.role_tier === "admin" || authUser?.role_tier === "manager";
    const canFinish = isAssignee || isManager;
    const isPendingApproval = task.pending_approval === true;
    const isDone = (task.status ?? "backlog") === "done";
    const showFinish = canFinish && !isDone && !isPendingApproval && !allReqsApproved;

    const handleAddTag = async () => {
        const v = tagInput.trim();
        if (!v) return;
        const snapshot = task.tags;
        patchTaskLocal(task.id, { tags: [...snapshot, v] });
        setTagInput("");
        setShowTagInput(false);
        const ok = await addTagHandler(task.id, v);
        if (!ok) patchTaskLocal(task.id, { tags: snapshot });
    };

    const handleRemoveTag = async (tagId: string) => {
        const snapshot = task.tags;
        patchTaskLocal(task.id, { tags: snapshot.filter((t) => (typeof t === "string" ? t : t.id) !== tagId) });
        const ok = await removeTagHandler(task.id, tagId);
        if (!ok) patchTaskLocal(task.id, { tags: snapshot });
    };

    const handleDelete = async () => {
        setConfirmDelete(false);
        const ok = await deleteTaskHandler(task.id);
        if (ok) {
            removeTaskLocal(task.id);
            onOpenChange(false);
        }
    };

    const requirements = task.requirements ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority as TaskPriority] ?? "default"}>{t(capitalize(task.priority))}</Badge>
                        {task.is_blocked && <Badge variant="error"><AlertCircle className="h-3 w-3 me-1" />{t("Blocked")}</Badge>}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete(true)}
                            className="ms-auto text-error hover:text-error hover:bg-error-light gap-1.5 h-7 px-2 me-8"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("Delete")}
                        </Button>
                    </div>
                    <DialogTitle className="text-xl">{task.title}</DialogTitle>
                    <DialogDescription>{task.description}</DialogDescription>
                </DialogHeader>

                {/* Phase navigation */}
                <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-xl bg-muted">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", COLUMN_COLORS[task.status ?? "backlog"] ?? "bg-text-muted")} />
                        <span className="text-sm font-semibold text-text-dark">{t(statusLabel(task.status ?? "backlog"))}</span>
                        {isPendingApproval && <Badge variant="warning" className="ms-1">{t("Awaiting Approval")}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                        {showFinish && (
                            <Button
                                size="sm"
                                variant="secondary"
                                loading={isMarkingComplete}
                                onClick={async () => {
                                    const res = await markCompleteHandler(task.id);
                                    if (res) patchTaskLocal(task.id, { pending_approval: true });
                                }}
                                className="gap-1.5"
                            >
                                {!isMarkingComplete && <Flag className="h-3.5 w-3.5" />}
                                {t("Finish")}
                            </Button>
                        )}
                        {nextStatus && !showFinish && !isPendingApproval && (
                            <Button size="sm" disabled={isMarkingComplete} onClick={() => { onOpenChange(false); onMoveRequest(task, nextStatus as TaskPhase); }} className="gap-1.5">
                                {t(nextLabel ?? "")}<ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {!nextStatus && <Badge variant="success" className="px-3 py-1.5">{t("Completed")}</Badge>}
                    </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Assignee")}</p>
                            {task.assignee ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[8px]">{task.assignee.avatar_initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-text-dark">{task.assignee.full_name}</span>
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-text-muted">{t("Unassigned")}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Story Points")}</p>
                            <p className="text-sm font-medium text-text-dark">{task.story_points ?? "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Task Number")}</p>
                            <p className="text-sm font-medium text-text-dark">{task.task_number ?? task.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Created")}</p>
                            <p className="text-sm font-medium text-text-dark">{formatDate(task.created_at ?? "")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Status")}</p>
                            <span className={cn("text-sm font-semibold", COLUMN_COLORS[task.status ?? "backlog"]?.replace("bg-", "text-"))}>
                                {t(statusLabel(task.status ?? "backlog"))}
                            </span>
                        </div>
                    </div>
                    {task.estimated_hours && (
                        <div className="flex items-center gap-2">
                            <Circle className="h-4 w-4 text-text-muted" />
                            <div>
                                <p className="text-xs text-text-muted">{t("Estimated Hours")}</p>
                                <p className="text-sm font-medium text-text-dark">{task.estimated_hours}h</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div className="mt-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-text-muted flex items-center gap-1"><Tag className="h-3 w-3" />{t("Tags")}</p>
                        {!showTagInput && (
                            <button onClick={() => setShowTagInput(true)} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="h-3 w-3" /> {t("Add")}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {task.tags.map((tag) => (
                            <span key={typeof tag === "string" ? tag : tag.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                                {typeof tag === "string" ? tag : tag.tag}
                                <button onClick={() => handleRemoveTag(typeof tag === "string" ? tag : tag.id)} className="text-text-muted hover:text-error cursor-pointer">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {showTagInput && (
                            <div className="flex items-center gap-1">
                                <Input
                                    autoFocus
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                                    placeholder={t("Tag name")}
                                    className="h-7 text-xs w-28"
                                />
                                <Button size="sm" onClick={handleAddTag} className="h-7 px-2 text-xs">{t("Add")}</Button>
                                <Button size="sm" variant="ghost" onClick={() => { setShowTagInput(false); setTagInput(""); }} className="h-7 px-2 text-xs">{t("Cancel")}</Button>
                            </div>
                        )}
                        {task.tags.length === 0 && !showTagInput && (
                            <span className="text-xs text-text-muted italic">{t("No tags")}</span>
                        )}
                    </div>
                </div>

                {/* Blocker */}
                {task.is_blocked && blocker && (
                    <div className="mt-4 pb-4 border-b border-border rounded-xl bg-error-light p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-error" />
                            <h4 className="text-sm font-semibold text-error">{t("Blocker")}</h4>
                            <Badge variant={blocker.status === BlockerStatus.Escalated ? "error" : "warning"}>{t(capitalize(blocker.status ?? ""))}</Badge>
                        </div>
                        <p className="text-sm font-medium text-text-dark">{blocker.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{blocker.description}</p>
                    </div>
                )}

                {/* Requirements */}
                <div className="mt-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
                            <ListChecks className="h-3.5 w-3.5" />
                            {t("Requirements")}
                            {requirements.length > 0 && (
                                <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{requirements.length}</span>
                            )}
                        </p>
                        {!showReqInput && (
                            <button onClick={() => setShowReqInput(true)} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="h-3 w-3" /> {t("Add")}
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {isFetchingReqs && requirements.length === 0 && (
                            [...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted">
                                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                                    <Skeleton className="h-3 flex-1 max-w-xs" />
                                </div>
                            ))
                        )}
                        {requirements.map((req) => (
                            <div key={req.id} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 group", req.is_done ? "bg-success-light/50" : "bg-muted")}>
                                {editingReqId === req.id ? (
                                    <>
                                        {req.is_done
                                            ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            : <AlertCircle className="h-4 w-4 text-text-muted shrink-0" />}
                                        <Input
                                            autoFocus
                                            value={editingReqLabel}
                                            onChange={(e) => setEditingReqLabel(e.target.value)}
                                            onKeyDown={async (e) => {
                                                if (e.key === "Enter") {
                                                    const v = editingReqLabel.trim();
                                                    if (!v) return;
                                                    const res = await updateRequirementHandler(req.id, { content: v });
                                                    if (res) {
                                                        patchTaskLocal(task.id, { requirements: requirements.map((r) => r.id === req.id ? { ...r, content: res.content } : r) });
                                                        setEditingReqId(null);
                                                    }
                                                } else if (e.key === "Escape") {
                                                    setEditingReqId(null);
                                                }
                                            }}
                                            className="h-7 text-sm flex-1"
                                        />
                                        <Button size="sm" variant="ghost" onClick={() => setEditingReqId(null)} className="h-7 px-2 text-xs">{t("Cancel")}</Button>
                                    </>
                                ) : (
                                    <>
                                        <Checkbox
                                            id={`req-${req.id}`}
                                            checked={!!req.is_done}
                                            onCheckedChange={async () => {
                                                const optimisticDone = !req.is_done;
                                                patchTaskLocal(task.id, { requirements: requirements.map((r) => r.id === req.id ? { ...r, is_done: optimisticDone } : r) });
                                                const res = await toggleRequirementHandler(req.id);
                                                if (res) {
                                                    patchTaskLocal(task.id, { requirements: requirements.map((r) => r.id === req.id ? { ...r, is_done: res.is_done } : r) });
                                                } else {
                                                    patchTaskLocal(task.id, { requirements: requirements.map((r) => r.id === req.id ? { ...r, is_done: req.is_done } : r) });
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`req-${req.id}`}
                                            className={cn("text-sm flex-1 cursor-pointer", req.is_done ? "line-through text-text-muted" : "text-text-dark")}
                                        >
                                            {req.content}
                                        </label>
                                        <button
                                            onClick={() => { setEditingReqId(req.id); setEditingReqLabel(req.content ?? ""); }}
                                            className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const ok = await deleteRequirementHandler(req.id);
                                                if (ok) patchTaskLocal(task.id, { requirements: requirements.filter((r) => r.id !== req.id) });
                                            }}
                                            className="text-text-muted hover:text-error transition-colors cursor-pointer"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                        {showReqInput && (() => {
                            const submitRequirement = async () => {
                                const v = reqInput.trim();
                                if (!v) return;
                                const res = await createRequirementHandler(task.id, { content: v });
                                if (res) {
                                    patchTaskLocal(task.id, { requirements: [...requirements, res as RequirementInterface] });
                                    setReqInput("");
                                    setShowReqInput(false);
                                }
                            };
                            return (
                                <div className="flex items-center gap-2">
                                    <Input
                                        autoFocus
                                        value={reqInput}
                                        onChange={(e) => setReqInput(e.target.value)}
                                        onKeyDown={async (e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                await submitRequirement();
                                            } else if (e.key === "Escape") {
                                                setShowReqInput(false);
                                                setReqInput("");
                                            }
                                        }}
                                        placeholder={t("Requirement")}
                                        className="h-8 text-sm"
                                    />
                                    <Button size="sm" onClick={submitRequirement} disabled={!reqInput.trim()} loading={isAddingReq} className="h-8 px-3 text-xs">{t("Add")}</Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setShowReqInput(false); setReqInput(""); }} className="h-8 px-2 text-xs">{t("Cancel")}</Button>
                                </div>
                            );
                        })()}
                        {!isFetchingReqs && requirements.length === 0 && !showReqInput && (
                            <p className="text-xs text-text-muted italic">{t("No requirements yet")}</p>
                        )}
                    </div>
                </div>

                <TaskAttachments task={task} patchTaskLocal={patchTaskLocal} />
                <TaskTimeLogs task={task} members={members} patchTaskLocal={patchTaskLocal} />
                <TaskComments task={task} currentUserId={currentUserId} members={members} />

                {/* Delete confirmation */}
                <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>{t("Delete Task")}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-text-secondary">
                            {t("Are you sure you want to delete")} <strong className="text-text-dark">{task.title}</strong>? {t("This action cannot be undone.")}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={isDeletingTask}>{t("Cancel")}</Button>
                            <Button variant="destructive" onClick={handleDelete} loading={isDeletingTask}>{t("Delete")}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
};
