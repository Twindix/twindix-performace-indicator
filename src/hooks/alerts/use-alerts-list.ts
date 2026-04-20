import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useAlertsList = (sprintId: string) => {
    const [alerts, setAlerts] = useState<AlertInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!sprintId) return;
        setIsLoading(true);
        try {
            const res = await alertsService.listHandler(sprintId);
            setAlerts(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    useEffect(() => { fetch(); }, [fetch]);

    const patchAlertLocal = useCallback((alert: AlertInterface) => {
        setAlerts((prev) => {
            const exists = prev.some((a) => a.id === alert.id);
            return exists ? prev.map((a) => a.id === alert.id ? alert : a) : [...prev, alert];
        });
    }, []);

    const removeAlertLocal = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, []);

    return { alerts, isLoading, refetch: fetch, patchAlertLocal, removeAlertLocal };
};
