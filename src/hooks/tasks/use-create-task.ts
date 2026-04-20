import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { CreateTaskPayloadInterface, TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useCreateTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = useCallback(async (sprintId: string, payload: CreateTaskPayloadInterface): Promise<TaskInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.createHandler(sprintId, payload);
            toast.success(tasksConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createHandler, isLoading };
};
