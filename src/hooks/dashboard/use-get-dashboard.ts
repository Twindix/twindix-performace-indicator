import { useState } from "react";
import { toast } from "sonner";

import { dashboardConstants } from "@/constants";
import type { DashboardInterface, DashboardMetricsInterface, HealthScoreInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { dashboardService } from "@/services";

export const useGetDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (sprintId: string): Promise<DashboardInterface | null> => {
        if (!navigator.onLine) throw new Error(dashboardConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await dashboardService.fullHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getHealthScoreHandler = async (sprintId: string): Promise<HealthScoreInterface | null> => {
        if (!navigator.onLine) throw new Error(dashboardConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await dashboardService.healthScoreHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.healthScoreFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getMetricsHandler = async (sprintId: string): Promise<DashboardMetricsInterface | null> => {
        if (!navigator.onLine) throw new Error(dashboardConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await dashboardService.metricsHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.metricsFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getHealthScoreHandler, getMetricsHandler, isLoading };
};
