import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskTags = () => {
    const [isLoading, setIsLoading] = useState(false);

    const addHandler = useCallback(async (taskId: string, tag: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await tasksService.addTagsHandler(taskId, [tag]);
            toast.success(tasksConstants.messages.tagAddSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.tagAddFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeHandler = useCallback(async (taskId: string, tag: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await tasksService.removeTagHandler(taskId, tag);
            toast.success(tasksConstants.messages.tagRemoveSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.tagRemoveFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { addHandler, removeHandler, isLoading };
};