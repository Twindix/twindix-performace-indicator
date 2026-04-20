import { useCallback, useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useDeleteAlert = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await alertsService.deleteHandler(id);
            toast.success(alertsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, alertsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { deleteHandler, isLoading };
};
