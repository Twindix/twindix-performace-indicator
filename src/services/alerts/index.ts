import { apisData } from "@/data";
import type { AlertDetailResponseInterface, AlertsCountResponseInterface, AlertsListFiltersInterface, AlertsListResponseInterface, CreateAlertPayloadInterface, UpdateAlertPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const alertsService = {
    listHandler: async (sprintId: string, filters?: AlertsListFiltersInterface): Promise<AlertsListResponseInterface> => {
        const { data } = await apiClient.get<AlertsListResponseInterface>(apisData.alerts.list(sprintId), { params: filters });
        return data;
    },

    countHandler: async (sprintId: string): Promise<AlertsCountResponseInterface> => {
        const { data } = await apiClient.get<AlertsCountResponseInterface>(apisData.alerts.count(sprintId));
        return data;
    },

    detailHandler: async (id: string): Promise<AlertDetailResponseInterface> => {
        const { data } = await apiClient.get<AlertDetailResponseInterface>(apisData.alerts.detail(id));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateAlertPayloadInterface): Promise<AlertDetailResponseInterface> => {
        const { data } = await apiClient.post<AlertDetailResponseInterface>(apisData.alerts.create(sprintId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateAlertPayloadInterface): Promise<AlertDetailResponseInterface> => {
        const { data } = await apiClient.put<AlertDetailResponseInterface>(apisData.alerts.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.alerts.delete(id));
    },

    acknowledgeHandler: async (id: string): Promise<AlertDetailResponseInterface> => {
        const { data } = await apiClient.patch<AlertDetailResponseInterface>(apisData.alerts.acknowledge(id));
        return data;
    },

    doneHandler: async (id: string): Promise<AlertDetailResponseInterface> => {
        const { data } = await apiClient.patch<AlertDetailResponseInterface>(apisData.alerts.done(id));
        return data;
    },
};
