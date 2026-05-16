import { useCallback } from "react";

import { commentsConstants } from "@/constants";
import type { CommentInterface, CommentsAnalyticsInterface } from "@/interfaces";
import { commentsService } from "@/services";

import { usePaginatedQuery, useQueryAction } from "../shared";

interface UseCommentsListOptions {
    status?: string;
    mention?: string;
    initialPerPage?: number;
}

export const useCommentsList = (sprintId: string, options: UseCommentsListOptions = {}) => {
    const { status, mention, initialPerPage } = options;

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<CommentInterface>(
        ({ page, per_page }) => commentsService.listHandler(sprintId, { status, mention, page, per_page }),
        [sprintId, status, mention],
        {
            enabled: !!sprintId,
            errorFallback: commentsConstants.errors.fetchFailed,
            context: "comments.list",
            initialPerPage,
        },
    );

    const { data: analytics, refetch: refetchAnalytics } = useQueryAction<CommentsAnalyticsInterface | null>(
        async () => (sprintId ? await commentsService.analyticsHandler(sprintId) : null),
        [sprintId],
        {
            enabled: !!sprintId,
            silent: true,
            errorFallback: commentsConstants.errors.analyticsFailed,
            initialData: null,
            context: "comments.analytics",
        },
    );

    const patchCommentLocal = useCallback((comment: CommentInterface) => {
        setItems((prev) => {
            const exists = prev.some((c) => c.id === comment.id);
            return exists
                ? prev.map((c) => (c.id === comment.id ? { ...c, ...comment } : c))
                : [comment, ...prev];
        });
    }, [setItems]);

    const removeCommentLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((c) => c.id !== id));
    }, [setItems]);

    return {
        comments: items,
        meta,
        page,
        perPage,
        analytics: analytics ?? null,
        isLoading,
        setPage,
        setPerPage,
        refetch,
        refetchAnalytics,
        patchCommentLocal,
        removeCommentLocal,
    };
};
