import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { commentsConstants } from "@/constants/comments";
import type { CommentInterface, CommentsAnalyticsInterface, CommentsContextInterface, CommentsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { commentsService } from "@/services";

const CommentsContext = createContext<CommentsContextInterface | null>(null);

export const CommentsProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [analytics, setAnalytics] = useState<CommentsAnalyticsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (filters?: CommentsListFiltersInterface): Promise<void> => {
        if (!sprintId) { setComments([]); return; }
        setIsLoading(true);
        try {
            const res = await commentsService.listHandler(sprintId, filters);
            setComments(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchAnalytics = useCallback(async (): Promise<void> => {
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
            return exists ? prev.map((c) => c.id === comment.id ? comment : c) : [...prev, comment];
        });
    }, []);

    const removeCommentLocal = useCallback((id: string) => {
        setComments((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const value = useMemo<CommentsContextInterface>(() => ({
        comments,
        analytics,
        isLoading,
        refetch,
        refetchAnalytics,
        patchCommentLocal,
        removeCommentLocal,
    }), [comments, analytics, isLoading, refetch, refetchAnalytics, patchCommentLocal, removeCommentLocal]);

    return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
};

export const useComments = (): CommentsContextInterface => {
    const ctx = useContext(CommentsContext);
    if (!ctx) throw new Error("useComments must be used within CommentsProvider");
    return ctx;
};
