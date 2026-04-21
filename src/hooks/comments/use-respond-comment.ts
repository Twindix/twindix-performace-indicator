import { useState } from "react";
import { toast } from "sonner";

import { commentsConstants } from "@/constants";
import type { CommentInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { commentsService } from "@/services";

export const useRespondComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const respondHandler = async (id: string): Promise<CommentInterface | null> => {
        if (!navigator.onLine) throw new Error(commentsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await commentsService.respondHandler(id);
            toast.success(commentsConstants.messages.respondSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.respondFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { respondHandler, isLoading };
};
