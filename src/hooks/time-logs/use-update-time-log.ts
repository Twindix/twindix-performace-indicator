import { useState } from "react";
import { toast } from "sonner";

import { timeLogsConstants } from "@/constants";
import type { TimeLogInterface, UpdateTimeLogPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { timeLogsService } from "@/services";

export const useUpdateTimeLog = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateTimeLogPayloadInterface): Promise<TimeLogInterface | null> => {
        if (!navigator.onLine) throw new Error(timeLogsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await timeLogsService.updateHandler(id, payload);
            toast.success(timeLogsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
