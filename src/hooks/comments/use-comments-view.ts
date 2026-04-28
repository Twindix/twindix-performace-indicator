import { useState } from "react";

import { commentsConstants } from "@/constants/comments";
import { useCommentsList, useCreateComment, useDeleteComment, usePageLoader, usePermissions, useRespondComment, useSettings, useUpdateComment, useUsersList } from "@/hooks";
import type { CommentFormHandlersInterface, CommentFormState, CommentInterface, CommentsCallbacksInterface, CommentsFilterHandlersInterface, CommentsPermissionsInterface, CommentsStatsInterface, UseCommentsViewReturnInterface } from "@/interfaces";
import { useSprintStore } from "@/store";

export const useCommentsView = (): UseCommentsViewReturnInterface => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const p = usePermissions();
    const { activeSprintId } = useSprintStore();
    const compact = settings.compactView;

    const [mentionFilter, setMentionFilter] = useState("all");
    const [responseFilter, setResponseFilter] = useState("all");

    const { comments, analytics, isLoading: isFetching, patchCommentLocal, removeCommentLocal, refetchAnalytics } = useCommentsList(activeSprintId, {
        status: responseFilter === "all" ? undefined : responseFilter,
        mention: mentionFilter === "all" ? undefined : mentionFilter,
    });
    const { users } = useUsersList();
    const { createHandler: createCommentHandler, isLoading: isCreating } = useCreateComment();
    const { updateHandler: updateCommentHandler, isLoading: isUpdating } = useUpdateComment();
    const { deleteHandler: deleteCommentHandler } = useDeleteComment();
    const { respondHandler: respondCommentHandler } = useRespondComment();

    const [viewTarget, setViewTarget] = useState<CommentInterface | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CommentInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CommentInterface | null>(null);
    const [form, setForm] = useState<CommentFormState>({ ...commentsConstants.emptyForm });

    const closeForm = () => {
        setAddOpen(false);
        setEditTarget(null);
        setForm({ ...commentsConstants.emptyForm });
    };

    const handleAdd = async () => {
        if (!form.body.trim() || !activeSprintId) return;
        const res = await createCommentHandler(activeSprintId, {
            body: form.body.trim(),
            task_title: form.task_title.trim() || undefined,
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) { patchCommentLocal(res); refetchAnalytics(); closeForm(); }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateCommentHandler(editTarget.id, {
            body: form.body.trim(),
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) { patchCommentLocal(res); setEditTarget(null); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteCommentHandler(deleteTarget.id);
        if (ok) { removeCommentLocal(deleteTarget.id); refetchAnalytics(); setDeleteTarget(null); }
    };

    const handleRespond = async (id: string) => {
        const res = await respondCommentHandler(id);
        if (res) { patchCommentLocal(res); refetchAnalytics(); }
    };

    const stats: CommentsStatsInterface = {
        total: analytics?.total_comments ?? comments.length,
        withMention: analytics?.with_mention ?? comments.filter((c) => c.mentioned_users.length > 0).length,
        withResponse: analytics?.responded ?? comments.filter((c) => !!c.responded_at).length,
        noResponse: analytics?.no_response ?? comments.filter((c) => !c.responded_at).length,
    };

    const formHandlers: CommentFormHandlersInterface = {
        onBodyChange: (v) => setForm((prev) => ({ ...prev, body: v })),
        onTaskTitleChange: (v) => setForm((prev) => ({ ...prev, task_title: v })),
        onMentionToggle: (userId, checked) => setForm((prev) => ({
            ...prev,
            mentioned_user_ids: checked
                ? [...prev.mentioned_user_ids, userId]
                : prev.mentioned_user_ids.filter((i) => i !== userId),
        })),
        onSubmit: editTarget ? handleEdit : handleAdd,
        onClose: closeForm,
    };

    const permissions: CommentsPermissionsInterface = {
        canRespond: () => p.comments.respond(),
        canEdit: (c) => p.comments.edit(c),
        canDelete: (c) => p.comments.delete(c),
    };

    const callbacks: CommentsCallbacksInterface = {
        onView: (c) => setViewTarget(c),
        onEdit: (c) => {
            setForm({ body: c.body, task_title: c.task_title ?? "", mentioned_user_ids: c.mentioned_users.map((m) => m.id) });
            setEditTarget(c);
        },
        onDelete: (c) => setDeleteTarget(c),
        onRespond: handleRespond,
    };

    return {
        comments,
        stats,
        users,
        isLoading: pageLoading || isFetching,
        compact,
        mentionFilter,
        responseFilter,
        filterHandlers: {
            onMentionChange: setMentionFilter,
            onResponseChange: setResponseFilter,
            onClear: () => { setMentionFilter("all"); setResponseFilter("all"); },
        } satisfies CommentsFilterHandlersInterface,
        viewTarget,
        addOpen,
        editTarget,
        deleteTarget,
        form,
        formHandlers,
        canAdd: p.comments.add(),
        permissions,
        callbacks,
        onAddOpen: () => { setForm({ ...commentsConstants.emptyForm }); setAddOpen(true); },
        onViewClose: () => setViewTarget(null),
        onDeleteClose: () => setDeleteTarget(null),
        onDeleteConfirm: handleDelete,
        busy: isCreating || isUpdating,
    };
};
