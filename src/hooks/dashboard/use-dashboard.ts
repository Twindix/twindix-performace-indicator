import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { dashboardConstants } from "@/constants";
import type { DashboardInterface, DashboardMetricsInterface, HealthScoreInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { dashboardService } from "@/services";

export const useDashboard = (sprintId: string) => {
    const [dashboard, setDashboard] = useState<DashboardInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!sprintId) { setDashboard(null); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await dashboardService.fullHandler(sprintId);
            setDashboard(res);
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchHealthScore = useCallback(async () => {
        if (!sprintId) return;
        try {
            const res: HealthScoreInterface = await dashboardService.healthScoreHandler(sprintId);
            setDashboard((prev) => prev ? { ...prev, health_score: res } : prev);
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.healthScoreFailed));
        }
    }, [sprintId]);

    const refetchMetrics = useCallback(async () => {
        if (!sprintId) return;
        try {
            const res: DashboardMetricsInterface = await dashboardService.metricsHandler(sprintId);
            setDashboard((prev) => prev ? { ...prev, metrics: res } : prev);
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.metricsFailed));
        }
    }, [sprintId]);

    useEffect(() => { refetch(); }, [refetch]);

    return {
        dashboard,
        healthScore: dashboard?.health_score ?? null,
        metrics: dashboard?.metrics ?? null,
        isLoading,
        refetch,
        refetchHealthScore,
        refetchMetrics,
    };
};
