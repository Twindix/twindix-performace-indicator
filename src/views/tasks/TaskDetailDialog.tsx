import { useEffect, useState } from "react";
import { Activity, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Circle, ClipboardList, Layers, ListChecks, Pencil, Plus, Tag, Trash2, User, X } from "lucide-react";

import { Badge, Button, Input } from "@/atoms";
import { useTasks } from "@/contexts";
import { BlockerStatus, TaskStatus } from "@/enums";
import { t, useCreateRequirement, useDeleteRequirement, useDeleteTask, useGetRequirement, useTaskTags, useToggleRequirement, useUpdateRequirement, useUpdateTaskStatus } from "@/hooks";
import type { TaskPhase } from "@/enums";
import type { TaskInterface, TaskCommentInterface, UserInterface, BlockerInterface, RequirementInterface } from "@/interfaces";
import {
    Avatar, AvatarFallback, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";
import { PHASE_INDEX, COLUMNS, COLUMN_COLORS, PRIORITY_VARIANT, capitalize, phaseLabel } from "../../data/seed/constants";
import { TaskAttachments } from "./TaskAttachments";
import { TaskTimeLogs } from "./TaskTimeLogs";
import { TaskComments } from "./TaskComments";

export interface TaskDetailDialogProps {
    task: TaskInterface | null;
    members: UserInterface[];
    blocker: BlockerInterface | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
    onUpdateComments?: (taskId: string, comments: TaskCommentInterface[]) => void;
    onUpdateRequirements?: (taskId: string, requirements: RequirementInterface[]) => void;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
    [TaskStatus.OnTrack]: "On Track",
    [TaskStatus.AtRisk]: "At Risk",
    [TaskStatus.Delayed]: "Delayed",
    [TaskStatus.OnHold]: "On Hold",
};
const STATUS_COLOR: Record<TaskStatus, string> = {
    [TaskStatus.OnTrack]: "text-green-600",
    [TaskStatus.AtRisk]: "text-yellow-600",
    [TaskStatus.Delayed]: "text-orange-600",
    [TaskStatus.OnHold]: "text-gray-500",
};

export const TaskDetailDialog = ({ task, members, blocker, open, onOpenChange, onMoveRequest, onUpdateComments, onUpdateRequirements: _onUpdateRequirements }: TaskDetailDialogProps) => {
    const { patchTaskLocal, removeTaskLocal } = useTasks();
    const { deleteHandler: deleteTaskHandler } = useDeleteTask();
    const { addHandler: addTagHandler, removeHandler: removeTagHandler } = useTaskTags();
    const { updateStatusHandler: updateTaskStatusHandler } = useUpdateTaskStatus();
    const { getAllHandler: getRequirementsHandler } = useGetRequirement();
    const { createHandler: createRequirementHandler } = useCreateRequirement();
    const { toggleHandler: toggleRequirementHandler } = useToggleRequirement();
    const { updateHandler: updateRequirementHandler } = useUpdateRequirement();
    const { deleteHandler: deleteRequirementHandler } = useDeleteRequirement();
    const [editingReqId, setEditingReqId] = useState<string | null>(null);
    const [editingReqLabel, setEditingReqLabel] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [showTagInput, setShowTagInput] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [reqInput, setReqInput] = useState("");
    const [showReqInput, setShowReqInput] = useState(false);

    const currentUserId = getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "";
    const allMembers = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? members;

    useEffect(() => {
        if (!open || !task) return;
        getRequirementsHandler(task.id).then((res) => {
            if (res) patchTaskLocal(task.id, { requirements: res.map((r) => ({ id: r.id, label: r.label, met: r.met })) });
        });
    }, [open, task?.id, getRequirementsHandler, patchTaskLocal]);

    if (!task) return null;

    const currentIndex = PHASE_INDEX[task.phase];
    const prevPhase = currentIndex > 0 ? COLUMNS[currentIndex - 1].phase : null;
    const nextPhase = currentIndex < COLUMNS.length - 1 ? COLUMNS[currentIndex + 1].phase : null;

    const handleAddTag = async () => {
        const v = tagInput.trim();
        if (!v) return;
        const res = await addTagHandler(task.id, [v]);
        if (res) patchTaskLocal(task.id, { tags: res.tags });
        setTagInput("");
        setShowTagInput(false);
    };

    const handleRemoveTag = async (tag: string) => {
        const res = await removeTagHandler(task.id, tag);
        if (res) patchTaskLocal(task.id, { tags: res.tags });
    };

    const handleStatusChange = async (next: TaskStatus) => {
        const res = await updateTaskStatusHandler(task.id, next);
        if (res) patchTaskLocal(task.id, { status: res.status });
    };

    const handleDelete = async () => {
        const ok = await deleteTaskHandler(task.id);
        if (ok) {
            removeTaskLocal(task.id);
            setConfirmDelete(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>{t(capitalize(task.priority))}</Badge>
                        {task.hasBlocker && <Badge variant="error"><AlertCircle className="h-3 w-3 me-1" />{t("Blocked")}</Badge>}
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
                    {prevPhase
                        ? <Button variant="secondary" size="sm" onClick={() => { onOpenChange(false); onMoveRequest(task, prevPhase); }} className="gap-1.5">
                            <ArrowLeft className="h-3.5 w-3.5" />{t(COLUMNS[currentIndex - 1].label)}
                          </Button>
                        : <div />}
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", COLUMN_COLORS[task.phase])} />
                        <span className="text-sm font-semibold text-text-dark">{t(phaseLabel(task.phase))}</span>
                    </div>
                    {nextPhase
                        ? <Button size="sm" onClick={() => { onOpenChange(false); onMoveRequest(task, nextPhase); }} className="gap-1.5">
                            {t(COLUMNS[currentIndex + 1].label)}<ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        : <Badge variant="success" className="px-3 py-1.5">{t("Completed")}</Badge>}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Assignees")}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {(task.assigneeIds ?? []).length > 0 ? (
                                    (task.assigneeIds ?? []).map((id) => {
                                        const assignee = allMembers.find((m) => m.id === id);
                                        return assignee ? (
                                            <div key={id} className="flex items-center gap-1">
                                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{assignee.avatar}</AvatarFallback></Avatar>
                                                <span className="text-sm font-medium text-text-dark">{assignee.name}</span>
                                            </div>
                                        ) : null;
                                    })
                                ) : (
                                    <span className="text-sm font-medium text-text-muted">{t("Unassigned")}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Story Points")}</p>
                            <p className="text-sm font-medium text-text-dark">{task.storyPoints}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Phase")}</p>
                            <p className="text-sm font-medium text-text-dark">{t(phaseLabel(task.phase))}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Created")}</p>
                            <p className="text-sm font-medium text-text-dark">{formatDate(task.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <Activity className="h-4 w-4 text-text-muted" />
                        <div className="flex-1">
                            <p className="text-xs text-text-muted mb-1">{t("Status")}</p>
                            <Select value={task.status ?? TaskStatus.OnTrack} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                                <SelectTrigger className="h-8 text-sm w-44">
                                    <SelectValue>
                                        <span className={cn("font-semibold", task.status && STATUS_COLOR[task.status])}>
                                            {t(STATUS_LABEL[task.status ?? TaskStatus.OnTrack])}
                                        </span>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TaskStatus).map((s) => (
                                        <SelectItem key={s} value={s}>
                                            <span className={cn("font-semibold", STATUS_COLOR[s])}>{t(STATUS_LABEL[s])}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
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
                            <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="text-text-muted hover:text-error cursor-pointer">
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
                {task.hasBlocker && blocker && (
                    <div className="mt-4 pb-4 border-b border-border rounded-xl bg-error-light p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-error" />
                            <h4 className="text-sm font-semibold text-error">{t("Blocker")}</h4>
                            <Badge variant={blocker.status === BlockerStatus.Escalated ? "error" : "warning"}>{t(capitalize(blocker.status))}</Badge>
                        </div>
                        <p className="text-sm font-medium text-text-dark">{blocker.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{blocker.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-text-muted">{t("Severity")}: <strong className="text-error">{t(capitalize(blocker.severity))}</strong></span>
                            <span className="text-xs text-text-muted">{t("Duration")}: <strong>{blocker.duration_days ?? 0} {t("days")}</strong></span>
                        </div>
                    </div>
                )}

                {/* Requirements */}
                <div className="mt-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
                            <ListChecks className="h-3.5 w-3.5" />
                            {t("Requirements")}
                            {(task.requirements ?? []).length > 0 && (
                                <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{(task.requirements ?? []).length}</span>
                            )}
                        </p>
                        {!showReqInput && (
                            <button onClick={() => setShowReqInput(true)} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="h-3 w-3" /> {t("Add")}
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {(task.requirements ?? []).map((req) => (
                            <div key={req.id} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 group", req.met ? "bg-success-light/50" : "bg-error-light/50")}>
                                {editingReqId === req.id ? (
                                    <>
                                        {req.met
                                            ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            : <AlertCircle className="h-4 w-4 text-error shrink-0" />}
                                        <Input
                                            autoFocus
                                            value={editingReqLabel}
                                            onChange={(e) => setEditingReqLabel(e.target.value)}
                                            onKeyDown={async (e) => {
                                                if (e.key === "Enter") {
                                                    const v = editingReqLabel.trim();
                                                    if (!v) return;
                                                    const res = await updateRequirementHandler(req.id, { label: v });
                                                    if (res) {
                                                        const updated = (task.requirements ?? []).map((r) => r.id === req.id ? { ...r, label: res.label } : r);
                                                        patchTaskLocal(task.id, { requirements: updated });
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
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const res = await toggleRequirementHandler(req.id);
                                                if (res) {
                                                    const updated = (task.requirements ?? []).map((r) => r.id === req.id ? { ...r, met: res.met } : r);
                                                    patchTaskLocal(task.id, { requirements: updated });
                                                }
                                            }}
                                            className="flex items-center gap-3 flex-1 text-start cursor-pointer hover:opacity-80"
                                        >
                                            {req.met
                                                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                : <AlertCircle className="h-4 w-4 text-error shrink-0" />}
                                            <span className={cn("text-sm", req.met ? "text-text-dark" : "text-error font-medium")}>
                                                {req.label}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => { setEditingReqId(req.id); setEditingReqLabel(req.label); }}
                                            className="text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            aria-label={t("Edit")}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const ok = await deleteRequirementHandler(req.id);
                                                if (ok) patchTaskLocal(task.id, { requirements: (task.requirements ?? []).filter((r) => r.id !== req.id) });
                                            }}
                                            className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                        {showReqInput && (
                            <div className="flex items-center gap-2">
                                <Input
                                    autoFocus
                                    value={reqInput}
                                    onChange={(e) => setReqInput(e.target.value)}
                                    onKeyDown={async (e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const v = reqInput.trim();
                                            if (!v) return;
                                            const res = await createRequirementHandler(task.id, { label: v });
                                            if (res) {
                                                patchTaskLocal(task.id, {
                                                    requirements: [...(task.requirements ?? []), { id: res.id, label: res.label, met: res.met }],
                                                });
                                                setReqInput("");
                                                setShowReqInput(false);
                                            }
                                        }
                                    }}
                                    placeholder={t("Requirement label")}
                                    className="h-8 text-sm"
                                />
                                <Button size="sm" variant="ghost" onClick={() => { setShowReqInput(false); setReqInput(""); }} className="h-8 px-2 text-xs">{t("Cancel")}</Button>
                            </div>
                        )}
                        {(task.requirements ?? []).length === 0 && !showReqInput && (
                            <p className="text-xs text-text-muted italic">{t("No requirements yet")}</p>
                        )}
                    </div>
                </div>


                <TaskAttachments task={task} />
                <TaskTimeLogs task={task} members={members} />
                <TaskComments task={task} currentUserId={currentUserId} members={members} onUpdateComments={onUpdateComments} />

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
                            <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t("Cancel")}</Button>
                            <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
};
