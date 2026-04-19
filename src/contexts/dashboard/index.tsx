import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { dashboardConstants } from "@/constants/dashboard";
import type { DashboardContextInterface, DashboardInterface, DashboardMetricsInterface, HealthScoreInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { dashboardService } from "@/services";

const DashboardContext = createContext<DashboardContextInterface | null>(null);

export const DashboardProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [dashboard, setDashboard] = useState<DashboardInterface | null>(null);
    const [healthScore, setHealthScore] = useState<HealthScoreInterface | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetricsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (): Promise<void> => {
        if (!sprintId) { setDashboard(null); return; }
        setIsLoading(true);
        try {
            const res = await dashboardService.fullHandler(sprintId);
            setDashboard(res.data);
            if (res.data.health_score) setHealthScore(res.data.health_score);
            if (res.data.metrics) setMetrics(res.data.metrics);
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchHealthScore = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await dashboardService.healthScoreHandler(sprintId);
            setHealthScore(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.healthScoreFailed));
        }
    }, [sprintId]);

    const refetchMetrics = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await dashboardService.metricsHandler(sprintId);
            setMetrics(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, dashboardConstants.errors.metricsFailed));
        }
    }, [sprintId]);

    useEffect(() => { refetch(); }, [refetch]);

    const value = useMemo<DashboardContextInterface>(() => ({
        dashboard,
        healthScore,
        metrics,
        isLoading,
        refetch,
        refetchHealthScore,
        refetchMetrics,
    }), [dashboard, healthScore, metrics, isLoading, refetch, refetchHealthScore, refetchMetrics]);

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = (): DashboardContextInterface => {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
    return ctx;
};
