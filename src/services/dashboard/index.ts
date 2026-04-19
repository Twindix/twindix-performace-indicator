import { apisData } from "@/data";
import type { DashboardMetricsResponseInterface, DashboardResponseInterface, HealthScoreResponseInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const dashboardService = {
    fullHandler: async (sprintId: string): Promise<DashboardResponseInterface> => {
        const { data } = await apiClient.get<DashboardResponseInterface>(apisData.dashboard.full(sprintId));
        return data;
    },

    healthScoreHandler: async (sprintId: string): Promise<HealthScoreResponseInterface> => {
        const { data } = await apiClient.get<HealthScoreResponseInterface>(apisData.dashboard.healthScore(sprintId));
        return data;
    },

    metricsHandler: async (sprintId: string): Promise<DashboardMetricsResponseInterface> => {
        const { data } = await apiClient.get<DashboardMetricsResponseInterface>(apisData.dashboard.metrics(sprintId));
        return data;
    },
};
