import { useCallback, useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useAcknowledgeAlert = () => {
    const [isLoading, setIsLoading] = useState(false);

    const acknowledgeHandler = useCallback(async (id: string): Promise<AlertInterface | null> => {
        setIsLoading(true);
        try {
            const res = await alertsService.acknowledgeHandler(id);
            toast.success(alertsConstants.messages.acknowledgeSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.acknowledgeFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { acknowledgeHandler, isLoading };
};
