import { useCallback, useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import type { AlertInterface, CreateAlertPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useCreateAlert = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = useCallback(async (sprintId: string, payload: CreateAlertPayloadInterface): Promise<AlertInterface | null> => {
        setIsLoading(true);
        try {
            const res = await alertsService.createHandler(sprintId, payload);
            toast.success(alertsConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, alertsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createHandler, isLoading };
};
