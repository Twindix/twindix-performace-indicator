import { apisData } from "@/data";
import type { DashboardInterface, DashboardMetricsInterface, HealthScoreInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const dashboardService = {
    fullHandler: async (sprintId: string): Promise<DashboardInterface> => {
        const { data } = await apiClient.get<DashboardInterface>(apisData.dashboard.full(sprintId));
        return data;
    },

    healthScoreHandler: async (sprintId: string): Promise<HealthScoreInterface> => {
        const { data } = await apiClient.get<HealthScoreInterface>(apisData.dashboard.healthScore(sprintId));
        return data;
    },

    metricsHandler: async (sprintId: string): Promise<DashboardMetricsInterface> => {
        const { data } = await apiClient.get<DashboardMetricsInterface>(apisData.dashboard.metrics(sprintId));
        return data;
    },
};
