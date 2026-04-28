import { t, usePermissions, useTaskDetail } from "@/hooks";
import type { TaskDetailDialogPropsInterface } from "@/interfaces";
import { useAuthStore } from "@/store";
import { Dialog, DialogContent } from "@/ui";

import { DeleteTaskConfirmDialog } from "./delete-confirm-dialog";
import { TaskAttachmentsSection } from "./attachments-section";
import { TaskBlockerSection } from "./blocker-section";
import { TaskCommentsSection } from "./comments-section";
import { TaskDetailHeader } from "./header";
import { TaskMetaGrid } from "./meta-grid";
import { TaskPhaseNavigation } from "./phase-navigation";
import { TaskRequirementsSection } from "./requirements-section";
import { TaskTagsSection } from "./tags-section";
import { TaskTimeLogsSection } from "./time-logs-section";

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

export { TaskDetailHeader } from "./header";
export { TaskPhaseNavigation } from "./phase-navigation";
export { TaskMetaGrid } from "./meta-grid";
export { TaskTagsSection } from "./tags-section";
export { TaskBlockerSection } from "./blocker-section";
export { TaskRequirementsSection } from "./requirements-section";
export { TaskRequirementItem } from "./requirement-item";
export { TaskAttachmentsSection } from "./attachments-section";
export { TaskTimeLogsSection } from "./time-logs-section";
export { TaskCommentsSection } from "./comments-section";
export { MentionDropdown } from "./mention-dropdown";
export { DeleteTaskConfirmDialog } from "./delete-confirm-dialog";
