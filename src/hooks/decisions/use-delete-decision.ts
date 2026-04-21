import { useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

export const useDeleteDecision = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await decisionsService.deleteHandler(id);
            toast.success(decisionsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
