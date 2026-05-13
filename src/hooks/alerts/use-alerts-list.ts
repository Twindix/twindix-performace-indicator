import { useCallback } from "react";

import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { alertsService } from "@/services";

import { usePaginatedQuery } from "../shared";

export interface UseAlertsListOptions {
    type?: string;
    initialPerPage?: number;
}

export const useAlertsList = (sprintId: string, { type, initialPerPage }: UseAlertsListOptions = {}) => {
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<AlertInterface>(
        ({ page, per_page }) => alertsService.listHandler(sprintId, { type, page, per_page }),
        [sprintId, type],
        {
            enabled: !!sprintId,
            errorFallback: alertsConstants.errors.fetchFailed,
            context: "alerts.list",
            initialPerPage,
        },
    );

    const patchAlertLocal = useCallback((alert: AlertInterface) => {
        setItems((prev) => {
            const exists = prev.some((a) => a.id === alert.id);
            return exists
                ? prev.map((a) => (a.id === alert.id ? { ...a, ...alert } : a))
                : [alert, ...prev];
        });
    }, [setItems]);

    const removeAlertLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((a) => a.id !== id));
    }, [setItems]);

    return { alerts: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchAlertLocal, removeAlertLocal };
};
