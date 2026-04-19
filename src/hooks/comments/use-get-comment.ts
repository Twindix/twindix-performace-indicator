import { useState } from "react";
import { toast } from "sonner";

import { commentsConstants } from "@/constants";
import type { CommentInterface, CommentsAnalyticsInterface, CommentsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { commentsService } from "@/services";

export const useGetComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<CommentInterface | null> => {
        if (!navigator.onLine) throw new Error(commentsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await commentsService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (sprintId: string, filters?: CommentsListFiltersInterface): Promise<CommentInterface[] | null> => {
        if (!navigator.onLine) throw new Error(commentsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await commentsService.listHandler(sprintId, filters);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAnalyticsHandler = async (sprintId: string): Promise<CommentsAnalyticsInterface | null> => {
        if (!navigator.onLine) throw new Error(commentsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await commentsService.analyticsHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.analyticsFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, getAnalyticsHandler, isLoading };
};
