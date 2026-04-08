import { AlertCircle, ArrowLeft, ArrowRight, Circle, ClipboardList, Layers, Tag, User } from "lucide-react";
import { Badge, Button } from "@/atoms";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";
import { t } from "@/hooks";
import { BlockerStatus } from "@/enums";
import type { TaskPhase } from "@/enums";
import type { TaskInterface, TaskAttachmentInterface, TaskCommentInterface, TaskTimeLogInterface, UserInterface, BlockerInterface } from "@/interfaces";
import { PHASE_INDEX, COLUMNS, COLUMN_COLORS, PRIORITY_VARIANT, capitalize, phaseLabel } from "../../data/seed/constants";
import { TaskAttachments } from "./TaskAttachments";
import { TaskTimeLogs } from "./TaskTimeLogs";
import { TaskComments } from "./TaskComments";

export interface TaskDetailDialogProps {
    task: TaskInterface | null;
    member: UserInterface | undefined;
    blocker: BlockerInterface | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
    onUpdateComments?: (taskId: string, comments: TaskCommentInterface[]) => void;
    onUpdateAttachments?: (taskId: string, attachments: TaskAttachmentInterface[]) => void;
    onUpdateTimeLogs?: (taskId: string, timeLogs: TaskTimeLogInterface[]) => void;
}

export const TaskDetailDialog = ({ task, member, blocker, open, onOpenChange, onMoveRequest, onUpdateComments, onUpdateAttachments, onUpdateTimeLogs }: TaskDetailDialogProps) => {
    const currentUserId = getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "";
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    if (!task) return null;

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
                            <p className="text-xs text-text-muted">{t("Assignee")}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{member?.avatar ?? "?"}</AvatarFallback></Avatar>
                                <span className="text-sm font-medium text-text-dark">{member?.name ?? t("Unassigned")}</span>
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

                <TaskAttachments task={task} onUpdateAttachments={onUpdateAttachments} />
                <TaskTimeLogs task={task} members={members} onUpdateTimeLogs={onUpdateTimeLogs} />
                <TaskComments task={task} currentUserId={currentUserId} members={members} onUpdateComments={onUpdateComments} />
            </DialogContent>
        </Dialog>
    );
};
