import { useState } from "react";
import { toast } from "sonner";

import { commentsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { commentsService } from "@/services";

export const useDeleteComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(commentsConstants.errors.genericError);
        setIsLoading(true);
        try {
            await commentsService.deleteHandler(id);
            toast.success(commentsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, commentsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
