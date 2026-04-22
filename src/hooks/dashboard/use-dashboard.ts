import { useCallback, useEffect, useState } from "react";

import { dashboardConstants } from "@/constants";
import type { DashboardInterface, DashboardMetricsInterface, HealthScoreInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { dashboardService } from "@/services";

export const useDashboard = (sprintId: string) => {
    const [dashboard, setDashboard] = useState<DashboardInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!sprintId) { setDashboard(null); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await runAction(() => dashboardService.fullHandler(sprintId), {
                errorFallback: dashboardConstants.errors.fetchFailed,
                context: "dashboard.full",
            });
            if (res) setDashboard(res);
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchHealthScore = useCallback(async () => {
        if (!sprintId) return;
        const res = await runAction<HealthScoreInterface>(() => dashboardService.healthScoreHandler(sprintId), {
            silent: true,
            context: "dashboard.health-score",
        });
        if (res) setDashboard((prev) => (prev ? { ...prev, health_score: res } : prev));
    }, [sprintId]);

    const refetchMetrics = useCallback(async () => {
        if (!sprintId) return;
        const res = await runAction<DashboardMetricsInterface>(() => dashboardService.metricsHandler(sprintId), {
            silent: true,
            context: "dashboard.metrics",
        });
        if (res) setDashboard((prev) => (prev ? { ...prev, metrics: res } : prev));
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
