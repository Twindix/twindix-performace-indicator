import { useCallback } from "react";

import { commentsConstants } from "@/constants";
import type { CommentInterface, CommentsAnalyticsInterface } from "@/interfaces";
import { commentsService } from "@/services";

import { useQueryAction } from "../shared";

interface UseCommentsListOptions {
    status?: string;
    mention?: string;
    per_page?: number;
}

export const useCommentsList = (sprintId: string, options: UseCommentsListOptions = {}) => {
    const { status, mention, per_page } = options;

    const {
        data: comments,
        isLoading,
        refetch,
        setData,
    } = useQueryAction<CommentInterface[]>(
        async () => {
            if (!sprintId) return [];
            const res = await commentsService.listHandler(sprintId, { status, mention, per_page });
            return res.data;
        },
        [sprintId, status, mention, per_page],
        {
            enabled: !!sprintId,
            errorFallback: commentsConstants.errors.fetchFailed,
            initialData: [],
            context: "comments.list",
        },
    );

    const {
        data: analytics,
        refetch: refetchAnalytics,
    } = useQueryAction<CommentsAnalyticsInterface | null>(
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
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((c) => c.id === comment.id);
            return exists
                ? arr.map((c) => (c.id === comment.id ? { ...c, ...comment } : c))
                : [comment, ...arr];
        });
    }, [setData]);

    const removeCommentLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((c) => c.id !== id));
    }, [setData]);

    return {
        comments: comments ?? [],
        analytics: analytics ?? null,
        isLoading,
        refetch,
        refetchAnalytics,
        patchCommentLocal,
        removeCommentLocal,
    };
};
