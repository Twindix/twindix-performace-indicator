import { CommentsLogSkeleton } from "@/components/skeletons";
import { useCommentsView } from "@/hooks/comments/use-comments-view";

import { CommentsFilters, CommentsHeader, CommentsList, CommentsStatsGrid } from "./components";
import { CommentDetailDialog, CommentFormDialog, DeleteCommentDialog } from "./dialogs";

export const CommentsLogView = () => {
    const {
        comments, stats, users, isLoading, compact,
        mentionFilter, responseFilter, filterHandlers,
        viewTarget, addOpen, editTarget, deleteTarget,
        form, formHandlers,
        canAdd, permissions, callbacks,
        onAddOpen, onViewClose, onDeleteClose, onDeleteConfirm,
        busy,
    } = useCommentsView();

    if (isLoading) return <CommentsLogSkeleton />;

    return (
        <div>
            <CommentsHeader canAdd={canAdd} onAdd={onAddOpen} />

            <CommentsStatsGrid stats={stats} compact={compact} />

            <CommentsFilters
                mentionFilter={mentionFilter}
                responseFilter={responseFilter}
                users={users}
                count={comments.length}
                compact={compact}
                handlers={filterHandlers}
            />

            <CommentsList comments={comments} permissions={permissions} callbacks={callbacks} />

            <CommentFormDialog
                open={addOpen}
                editTarget={editTarget}
                form={form}
                users={users}
                handlers={formHandlers}
                busy={busy}
            />

            <CommentDetailDialog comment={viewTarget} onClose={onViewClose} />

            <DeleteCommentDialog
                open={!!deleteTarget}
                onConfirm={onDeleteConfirm}
                onClose={onDeleteClose}
            />
        </div>
    );
};
