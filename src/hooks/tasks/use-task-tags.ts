import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskTags = () => {
    const [isLoading, setIsLoading] = useState(false);

    const addHandler = async (taskId: string, tags: string[]): Promise<TaskInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.addTagsHandler(taskId, tags);
            toast.success(tasksConstants.messages.tagAddSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.tagAddFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const removeHandler = async (taskId: string, tag: string): Promise<TaskInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.removeTagHandler(taskId, tag);
            toast.success(tasksConstants.messages.tagRemoveSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.tagRemoveFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { addHandler, removeHandler, isLoading };
};
