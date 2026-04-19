import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskInterface, UpdateTaskPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useUpdateTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateTaskPayloadInterface): Promise<TaskInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
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
    };

    return { updateHandler, isLoading };
};
