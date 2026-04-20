import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useDeleteTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = useCallback(async (id: string): Promise<boolean> => {
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
    }, []);

    return { deleteHandler, isLoading };
};