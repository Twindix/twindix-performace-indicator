import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { commentsConstants } from "@/constants";
import type { CommentInterface, CommentsAnalyticsInterface, CommentsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { commentsService } from "@/services";

export const useCommentsList = (sprintId: string, filters?: CommentsListFiltersInterface) => {
    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [analytics, setAnalytics] = useState<CommentsAnalyticsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!sprintId) { setComments([]); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await commentsService.listHandler(sprintId, filters);
            setComments(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId, filters]);

    const refetchAnalytics = useCallback(async () => {
        if (!sprintId) { setAnalytics(null); return; }
        try {
            const res = await commentsService.analyticsHandler(sprintId);
            setAnalytics(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.analyticsFailed));
        }
    }, [sprintId]);

    useEffect(() => {
        refetch();
        refetchAnalytics();
    }, [refetch, refetchAnalytics]);

    const patchCommentLocal = useCallback((comment: CommentInterface) => {
        setComments((prev) => {
            const exists = prev.some((c) => c.id === comment.id);
            return exists ? prev.map((c) => c.id === comment.id ? comment : c) : [comment, ...prev];
        });
    }, []);

    const removeCommentLocal = useCallback((id: string) => {
        setComments((prev) => prev.filter((c) => c.id !== id));
    }, []);

    return { comments, analytics, isLoading, refetch, refetchAnalytics, patchCommentLocal, removeCommentLocal };
};
