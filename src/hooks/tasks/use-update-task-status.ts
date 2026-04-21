import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useUpdateTaskStatus = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateStatusHandler = useCallback(async (id: string, status: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await tasksService.updateStatusHandler(id, { status });
            toast.success(tasksConstants.messages.updateSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.updateFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateStatusHandler, isLoading };
};
