import { useCallback } from "react";

import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { alertsService } from "@/services";

import { useQueryAction } from "../shared";

export const useAlertsList = (sprintId: string) => {
    const { data, isLoading, refetch, setData } = useQueryAction<AlertInterface[]>(
        async () => (sprintId ? (await alertsService.listHandler(sprintId)).data : []),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: alertsConstants.errors.fetchFailed,
            initialData: [],
            context: "alerts.list",
        },
    );

    const patchAlertLocal = useCallback((alert: AlertInterface) => {
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((a) => a.id === alert.id);
            return exists
                ? arr.map((a) => (a.id === alert.id ? { ...a, ...alert } : a))
                : [alert, ...arr];
        });
    }, [setData]);

    const removeAlertLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((a) => a.id !== id));
    }, [setData]);

    return { alerts: data ?? [], isLoading, refetch, patchAlertLocal, removeAlertLocal };
};
