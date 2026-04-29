import { MessageCircle, Plus } from "lucide-react";

import { Button } from "@/atoms";
import { CommentsLogSkeleton } from "@/components/skeletons";
import { EntityList, FiltersBar, Header, SelectField } from "@/components/shared";
import { commentsConstants } from "@/constants";
import { t, useCommentsView } from "@/hooks";

import { CommentCard, CommentsStatsGrid } from "@/components/comments-log";
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
            <Header
                title={t("Comments Log")}
                description={t("Track all task comments, mentions, and responses")}
                actions={
                    canAdd ? (
                        <Button onClick={onAddOpen} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("Add Comment")}
                        </Button>
                    ) : null
                }
            />

            <CommentsStatsGrid stats={stats} compact={compact} />

            <FiltersBar
                count={comments.length}
                countLabel={t("comments")}
                hasFilters={mentionFilter !== "all" || responseFilter !== "all"}
                onClear={filterHandlers.onClear}
                compact={compact}
            >
                <SelectField
                    value={mentionFilter}
                    onChange={filterHandlers.onMentionChange}
                    options={[{ value: "all", label: t("All Mentions") }, ...users.map((u) => ({ value: u.id, label: u.full_name }))]}
                    placeholder={t("Filter by mention")}
                    triggerClassName="w-[180px] h-9 text-xs"
                />
                <SelectField
                    value={responseFilter}
                    onChange={filterHandlers.onResponseChange}
                    options={commentsConstants.responseStatusOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
                    placeholder={t("Response status")}
                    triggerClassName="w-[160px] h-9 text-xs"
                />
            </FiltersBar>

            <EntityList
                    items={comments}
                    emptyIcon={MessageCircle}
                    emptyTitle={t("No Results")}
                    emptyDescription={t("No comments match the selected filters")}
                    renderItem={(comment) => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            permissions={permissions}
                            callbacks={callbacks}
                        />
                    )}
                />

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
