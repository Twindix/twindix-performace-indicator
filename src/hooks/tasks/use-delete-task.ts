import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useDeleteTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            await tasksService.deleteHandler(id);
            toast.success(tasksConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
