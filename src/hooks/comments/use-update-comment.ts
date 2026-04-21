import { useState } from "react";
import { toast } from "sonner";

import { commentsConstants } from "@/constants";
import type { CommentInterface, UpdateCommentPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { commentsService } from "@/services";

export const useUpdateComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateCommentPayloadInterface): Promise<CommentInterface | null> => {
        if (!navigator.onLine) throw new Error(commentsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await commentsService.updateHandler(id, payload);
            toast.success(commentsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
