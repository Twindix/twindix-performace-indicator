import { apisData } from "@/data";
import type { CreateSprintPayloadInterface, SprintDetailResponseInterface, SprintListResponseInterface, SprintSummaryResponseInterface, UpdateSprintPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const sprintsService = {
    listHandler: async (): Promise<SprintListResponseInterface> => {
        const { data } = await apiClient.get<SprintListResponseInterface>(apisData.sprints.list);
        return data;
    },

    detailHandler: async (id: string): Promise<SprintDetailResponseInterface> => {
        const { data } = await apiClient.get<SprintDetailResponseInterface>(apisData.sprints.detail(id));
        return data;
    },

    summaryHandler: async (id: string): Promise<SprintSummaryResponseInterface> => {
        const { data } = await apiClient.get<SprintSummaryResponseInterface>(apisData.sprints.summary(id));
        return data;
    },

    createHandler: async (payload: CreateSprintPayloadInterface): Promise<SprintDetailResponseInterface> => {
        const { data } = await apiClient.post<SprintDetailResponseInterface>(apisData.sprints.create, payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateSprintPayloadInterface): Promise<SprintDetailResponseInterface> => {
        const { data } = await apiClient.put<SprintDetailResponseInterface>(apisData.sprints.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.sprints.delete(id));
    },

    activateHandler: async (id: string): Promise<SprintDetailResponseInterface> => {
        const { data } = await apiClient.patch<SprintDetailResponseInterface>(apisData.sprints.activate(id));
        return data;
    },
};
