import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants/alerts";
import type { AlertInterface, AlertsContextInterface, AlertsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

const AlertsContext = createContext<AlertsContextInterface | null>(null);

export const AlertsProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertInterface[]>([]);
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (filters?: AlertsListFiltersInterface): Promise<void> => {
        if (!sprintId) { setAlerts([]); return; }
        setIsLoading(true);
        try {
            const res = await alertsService.listHandler(sprintId, filters);
            setAlerts(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchCount = useCallback(async (): Promise<void> => {
        if (!sprintId) { setCount(0); return; }
        try {
            const res = await alertsService.countHandler(sprintId);
            setCount(res.count);
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.countFailed));
        }
    }, [sprintId]);

    useEffect(() => {
        refetch();
        refetchCount();
    }, [refetch, refetchCount]);

    const patchAlertLocal = useCallback((alert: AlertInterface) => {
        setAlerts((prev) => {
            const exists = prev.some((a) => a.id === alert.id);
            return exists ? prev.map((a) => a.id === alert.id ? alert : a) : [...prev, alert];
        });
    }, []);

    const removeAlertLocal = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const value = useMemo<AlertsContextInterface>(() => ({
        alerts,
        count,
        isLoading,
        refetch,
        refetchCount,
        patchAlertLocal,
        removeAlertLocal,
    }), [alerts, count, isLoading, refetch, refetchCount, patchAlertLocal, removeAlertLocal]);

    return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
};

export const useAlerts = (): AlertsContextInterface => {
    const ctx = useContext(AlertsContext);
    if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
    return ctx;
};
