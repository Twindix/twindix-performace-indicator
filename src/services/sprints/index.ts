import { apisData } from "@/data";
import type { CreateSprintPayloadInterface, SprintDetailResponseInterface, SprintSummaryInterface, SprintsListResponseInterface, UpdateSprintPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const sprintsService = {
    listHandler: async (): Promise<SprintsListResponseInterface> => {
        const { data } = await apiClient.get<SprintsListResponseInterface>(apisData.sprints.list);
        return data;
    },

    detailHandler: async (id: string): Promise<SprintDetailResponseInterface> => {
        const { data } = await apiClient.get<SprintDetailResponseInterface>(apisData.sprints.detail(id));
        return data;
    },

    summaryHandler: async (id: string): Promise<SprintSummaryInterface> => {
        const { data } = await apiClient.get<SprintSummaryInterface>(apisData.sprints.summary(id));
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
        const { data } = await apiClient.post<SprintDetailResponseInterface>(apisData.sprints.activate(id), {});
        return data;
    },
};
