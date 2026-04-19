import { useState } from "react";
import { toast } from "sonner";

import { timeLogsConstants } from "@/constants";
import type { CreateTimeLogPayloadInterface, TimeLogInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { timeLogsService } from "@/services";

export const useCreateTimeLog = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (taskId: string, payload: CreateTimeLogPayloadInterface): Promise<TimeLogInterface | null> => {
        if (!navigator.onLine) throw new Error(timeLogsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await timeLogsService.createHandler(taskId, payload);
            toast.success(timeLogsConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
