import { useCallback, useState } from "react";

import { commentsConstants } from "@/constants";
import type { CommentInterface, CommentsAnalyticsInterface, CommentsListFiltersInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { commentsService } from "@/services";

export const useGetComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = useCallback(async (id: string): Promise<CommentInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => commentsService.detailHandler(id), {
                errorFallback: commentsConstants.errors.fetchDetailFailed,
                context: "comments.detail",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllHandler = useCallback(async (sprintId: string, filters?: CommentsListFiltersInterface): Promise<CommentInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await runAction(() => commentsService.listHandler(sprintId, filters), {
                errorFallback: commentsConstants.errors.fetchFailed,
                context: "comments.list-call",
            });
            return res?.data ?? null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAnalyticsHandler = useCallback(async (sprintId: string): Promise<CommentsAnalyticsInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => commentsService.analyticsHandler(sprintId), {
                silent: true,
                context: "comments.analytics-call",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getHandler, getAllHandler, getAnalyticsHandler, isLoading };
};
