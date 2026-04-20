import { useState } from "react";
import { toast } from "sonner";

import { timeLogsConstants } from "@/constants/time-logs";
import { getErrorMessage } from "@/lib/error";
import { timeLogsService } from "@/services";

export const useDeleteTimeLog = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await timeLogsService.deleteHandler(id);
            toast.success(timeLogsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};