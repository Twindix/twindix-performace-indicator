import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { UpdateTaskPayloadInterface, TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useUpdateTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = useCallback(async (id: string, payload: UpdateTaskPayloadInterface): Promise<TaskInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.updateHandler(id, payload);
            toast.success(tasksConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateHandler, isLoading };
};