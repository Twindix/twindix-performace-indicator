import { useCallback, useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import type { AlertInterface, UpdateAlertPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useUpdateAlert = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = useCallback(async (id: string, payload: UpdateAlertPayloadInterface): Promise<AlertInterface | null> => {
        setIsLoading(true);
        try {
            const res = await alertsService.updateHandler(id, payload);
            toast.success(alertsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, alertsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateHandler, isLoading };
};
