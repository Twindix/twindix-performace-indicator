import { Activity, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Circle, ClipboardList, Layers, ListChecks, Tag, User } from "lucide-react";
import { Badge, Button } from "@/atoms";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";
import { t } from "@/hooks";
import { BlockerStatus } from "@/enums";
import type { TaskPhase } from "@/enums";
import { TaskStatus } from "@/enums";
import type { TaskInterface, TaskAttachmentInterface, TaskCommentInterface, TaskTimeLogInterface, UserInterface, BlockerInterface, RequirementInterface } from "@/interfaces";
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
    onUpdateAttachments?: (taskId: string, attachments: TaskAttachmentInterface[]) => void;
    onUpdateTimeLogs?: (taskId: string, timeLogs: TaskTimeLogInterface[]) => void;
    onUpdateRequirements?: (taskId: string, requirements: RequirementInterface[]) => void;
}

export const TaskDetailDialog = ({ task, members, blocker, open, onOpenChange, onMoveRequest, onUpdateComments, onUpdateAttachments, onUpdateTimeLogs, onUpdateRequirements }: TaskDetailDialogProps) => {
    const currentUserId = getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "";
    const allMembers = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? members;

    if (!task) return null;

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

    const currentIndex = PHASE_INDEX[task.phase];
    const prevPhase = currentIndex > 0 ? COLUMNS[currentIndex - 1].phase : null;
    const nextPhase = currentIndex < COLUMNS.length - 1 ? COLUMNS[currentIndex + 1].phase : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>{t(capitalize(task.priority))}</Badge>
                        {task.hasBlocker && <Badge variant="error"><AlertCircle className="h-3 w-3 me-1" />{t("Blocked")}</Badge>}
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
                    {task.status && (
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-text-muted" />
                            <div>
                                <p className="text-xs text-text-muted">{t("Status")}</p>
                                <p className={cn("text-sm font-semibold", STATUS_COLOR[task.status])}>
                                    {t(STATUS_LABEL[task.status])}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                    <div className="mt-4 pb-4 border-b border-border">
                        <p className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1"><Tag className="h-3 w-3" />{t("Tags")}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                    </div>
                )}

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
                            <span className="text-xs text-text-muted">{t("Impact")}: <strong className="text-error">{t(capitalize(blocker.impact))}</strong></span>
                            <span className="text-xs text-text-muted">{t("Duration")}: <strong>{blocker.durationDays} {t("days")}</strong></span>
                        </div>
                    </div>
                )}

                {/* Requirements */}
                {(task.requirements ?? []).length > 0 && (
                    <div className="mt-4 pb-4 border-b border-border">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <ListChecks className="h-3.5 w-3.5" />
                            {t("Requirements")}
                        </p>
                        <div className="space-y-2">
                            {(task.requirements ?? []).map((req) => (
                                <button
                                    key={req.id}
                                    type="button"
                                    onClick={() => {
                                        if (!onUpdateRequirements) return;
                                        const updated = (task.requirements ?? []).map((r) =>
                                            r.id === req.id ? { ...r, met: !r.met } : r,
                                        );
                                        onUpdateRequirements(task.id, updated);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-start transition-opacity",
                                        req.met ? "bg-success-light/50" : "bg-error-light/50",
                                        onUpdateRequirements ? "cursor-pointer hover:opacity-80" : "cursor-default",
                                    )}
                                >
                                    {req.met
                                        ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                        : <AlertCircle className="h-4 w-4 text-error shrink-0" />}
                                    <span className={cn("text-sm", req.met ? "text-text-dark" : "text-error font-medium")}>
                                        {req.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <TaskAttachments task={task} onUpdateAttachments={onUpdateAttachments} />
                <TaskTimeLogs task={task} members={members} onUpdateTimeLogs={onUpdateTimeLogs} />
                <TaskComments task={task} currentUserId={currentUserId} members={members} onUpdateComments={onUpdateComments} />
            </DialogContent>
        </Dialog>
    );
};
