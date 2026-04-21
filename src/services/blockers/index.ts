import { apisData } from "@/data";
import type { BlockerDetailResponseInterface, BlockersAnalyticsInterface, BlockersListFiltersInterface, BlockersListResponseInterface, CreateBlockerPayloadInterface, UpdateBlockerPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const blockersService = {
    listHandler: async (sprintId: string, filters?: BlockersListFiltersInterface): Promise<BlockersListResponseInterface> => {
        const { data } = await apiClient.get<BlockersListResponseInterface>(apisData.blockers.list(sprintId), { params: filters });
        return data;
    },

    analyticsHandler: async (sprintId: string): Promise<BlockersAnalyticsInterface> => {
        const { data } = await apiClient.get<BlockersAnalyticsInterface>(apisData.blockers.analytics(sprintId));
        return data;
    },

    detailHandler: async (id: string): Promise<BlockerDetailResponseInterface> => {
        const { data } = await apiClient.get<BlockerDetailResponseInterface>(apisData.blockers.detail(id));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateBlockerPayloadInterface): Promise<BlockerDetailResponseInterface> => {
        const { data } = await apiClient.post<BlockerDetailResponseInterface>(apisData.blockers.create(sprintId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateBlockerPayloadInterface): Promise<BlockerDetailResponseInterface> => {
        const { data } = await apiClient.put<BlockerDetailResponseInterface>(apisData.blockers.update(id), payload);
        return data;
    },

    resolveHandler: async (id: string): Promise<BlockerDetailResponseInterface> => {
        const { data } = await apiClient.patch<BlockerDetailResponseInterface>(apisData.blockers.resolve(id));
        return data;
    },

    escalateHandler: async (id: string): Promise<BlockerDetailResponseInterface> => {
        const { data } = await apiClient.patch<BlockerDetailResponseInterface>(apisData.blockers.escalate(id));
        return data;
    },

    linkTasksHandler: async (id: string, taskIds: string[]): Promise<BlockerDetailResponseInterface> => {
        const { data } = await apiClient.post<BlockerDetailResponseInterface>(apisData.blockers.linkTasks(id), { task_ids: taskIds });
        return data;
    },

    unlinkTaskHandler: async (id: string, taskId: string): Promise<void> => {
        await apiClient.delete(apisData.blockers.unlinkTask(id, taskId));
    },
};
