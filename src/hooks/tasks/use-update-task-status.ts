import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskStatus } from "@/enums";
import type { TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useUpdateTaskStatus = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateStatusHandler = async (id: string, status: TaskStatus): Promise<TaskInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.updateStatusHandler(id, { status });
            toast.success(tasksConstants.messages.statusUpdateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.statusUpdateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateStatusHandler, isLoading };
};
