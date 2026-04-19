import { useState } from "react";
import { toast } from "sonner";

import { alertsConstants } from "@/constants";
import type { AlertInterface, AlertsCountInterface, AlertsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { alertsService } from "@/services";

export const useGetAlert = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<AlertInterface | null> => {
        if (!navigator.onLine) throw new Error(alertsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await alertsService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (sprintId: string, filters?: AlertsListFiltersInterface): Promise<AlertInterface[] | null> => {
        if (!navigator.onLine) throw new Error(alertsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await alertsService.listHandler(sprintId, filters);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getCountHandler = async (sprintId: string): Promise<AlertsCountInterface | null> => {
        if (!navigator.onLine) throw new Error(alertsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await alertsService.countHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, alertsConstants.errors.countFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, getCountHandler, isLoading };
};
