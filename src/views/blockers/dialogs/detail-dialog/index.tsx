import type { BlockerDetailDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogContent } from "@/ui";

import { BlockerDetailActions } from "./actions";
import { BlockerDetailHeader } from "./header";
import { BlockerDetailLinkedTasks } from "./linked-tasks";
import { BlockerDetailMeta } from "./meta";

export const BlockerDetailDialog = ({
    open,
    blocker,
    permissions,
    detail,
    actions,
}: BlockerDetailDialogPropsInterface) => {
    if (!blocker) return null;

    const isResolved = blocker.status === "resolved";
    const isEscalated = blocker.status === "escalated";

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) actions.onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <BlockerDetailHeader
                    blocker={blocker}
                    permissions={{
                        canEdit: permissions.blockers.edit(blocker),
                        canDelete: permissions.blockers.delete(),
                    }}
                    isDeleting={detail.isDeleting}
                    onEdit={() => actions.onEdit(blocker)}
                    onDelete={detail.onDelete}
                />

                <BlockerDetailMeta
                    reporter={blocker.reporter}
                    owner={blocker.owner}
                    createdAt={blocker.created_at}
                    durationDays={blocker.duration_days}
                />

                <BlockerDetailLinkedTasks tasks={blocker.tasks ?? []} />

                <BlockerDetailActions
                    status={{ isResolved, isEscalated, resolvedAt: blocker.resolved_at }}
                    permissions={{
                        canResolve: permissions.blockers.resolve(blocker),
                        canEscalate: permissions.blockers.escalate(blocker),
                    }}
                    busy={{ resolving: detail.isResolving, escalating: detail.isEscalating }}
                    onResolve={detail.onResolve}
                    onEscalate={detail.onEscalate}
                />
            </DialogContent>
        </Dialog>
    );
};

export { BlockerDetailHeader } from "./header";
export { BlockerDetailMeta } from "./meta";
export { BlockerDetailLinkedTasks } from "./linked-tasks";
export { BlockerDetailActions } from "./actions";
