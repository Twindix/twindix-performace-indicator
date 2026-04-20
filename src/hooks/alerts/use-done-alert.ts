import { useCallback, useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useDoneAlert = () => {
    const [isLoading, setIsLoading] = useState(false);

    const doneHandler = useCallback(async (id: string): Promise<AlertInterface | null> => {
        setIsLoading(true);
        try {
            const res = await alertsService.doneHandler(id);
            toast.success(alertsConstants.messages.doneSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.doneFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { doneHandler, isLoading };
};
