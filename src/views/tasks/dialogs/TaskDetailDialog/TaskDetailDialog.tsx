import { t, usePermissions, useTaskDetail } from "@/hooks";
import type { TaskDetailDialogPropsInterface } from "@/interfaces";
import { useAuthStore } from "@/store";
import { Dialog, DialogContent } from "@/ui";

import { DeleteTaskConfirmDialog } from "./DeleteTaskConfirmDialog";
import { TaskAttachmentsSection } from "./TaskAttachmentsSection";
import { TaskBlockerSection } from "./TaskBlockerSection";
import { TaskCommentsSection } from "./TaskCommentsSection";
import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskMetaGrid } from "./TaskMetaGrid";
import { TaskPhaseNavigation } from "./TaskPhaseNavigation";
import { TaskRequirementsSection } from "./TaskRequirementsSection";
import { TaskTagsSection } from "./TaskTagsSection";
import { TaskTimeLogsSection } from "./TaskTimeLogsSection";

void t;

export const TaskDetailDialog = ({
    task,
    members,
    blocker,
    open,
    onOpenChange,
    onMoveRequest,
    patchTaskLocal,
    removeTaskLocal,
}: TaskDetailDialogPropsInterface) => {
    const p = usePermissions();
    const { user: authUser } = useAuthStore();
    const currentUserId = authUser?.id ?? "";

    const detail = useTaskDetail({ task, open, onOpenChange, patchTaskLocal, removeTaskLocal });

    if (!task) return null;

    const canFinish = p.tasks.finishPhase(task);
    const canEdit = p.tasks.edit(task);
    const canToggleReq = p.tasks.toggleRequirement(task);
    const canMove = p.tasks.movePhase(task);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <TaskDetailHeader
                    task={task}
                    canDelete={p.tasks.delete()}
                    onRequestDelete={() => detail.setConfirmDelete(true)}
                />

                <TaskPhaseNavigation
                    task={task}
                    canFinish={canFinish}
                    canMove={canMove}
                    isMarkingComplete={detail.isMarkingComplete}
                    onMarkComplete={detail.handleMarkComplete}
                    onMoveNext={(target) => { onOpenChange(false); onMoveRequest(task, target); }}
                />

                <TaskMetaGrid task={task} />

                <TaskTagsSection task={task} canEdit={canEdit} patchTaskLocal={patchTaskLocal} />

                <TaskBlockerSection blocker={blocker} isBlocked={!!task.is_blocked} />

                <TaskRequirementsSection
                    task={task}
                    canToggleRequirement={canToggleReq}
                    isFetching={detail.isFetchingRequirements}
                    patchTaskLocal={patchTaskLocal}
                />

                <TaskAttachmentsSection task={task} patchTaskLocal={patchTaskLocal} />

                <TaskTimeLogsSection task={task} members={members} patchTaskLocal={patchTaskLocal} />

                <TaskCommentsSection task={task} currentUserId={currentUserId} members={members} />

                <DeleteTaskConfirmDialog
                    open={detail.confirmDelete}
                    onOpenChange={detail.setConfirmDelete}
                    taskTitle={task.title}
                    isDeleting={detail.isDeletingTask}
                    onConfirm={detail.handleDelete}
                />
            </DialogContent>
        </Dialog>
    );
};
