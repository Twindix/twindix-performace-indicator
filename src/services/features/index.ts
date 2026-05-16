import { apisData } from "@/data";
import type {
    CreateFeaturePayloadInterface,
    FeatureInterface,
    FeaturesListFiltersInterface,
    FeaturesListResponseInterface,
    UpdateFeaturePayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

export const featuresService = {
    listHandler: async (filters?: FeaturesListFiltersInterface): Promise<FeaturesListResponseInterface> => {
        const { data } = await apiClient.get<FeaturesListResponseInterface>(apisData.features.list, {
            params: filters,
        });
        return data;
    },

    detailHandler: async (id: string): Promise<FeatureInterface> => {
        const { data } = await apiClient.get(apisData.features.detail(id));
        return unwrap<FeatureInterface>(data);
    },

    createHandler: async (payload: CreateFeaturePayloadInterface): Promise<FeatureInterface> => {
        const { data } = await apiClient.post(apisData.features.create, payload);
        return unwrap<FeatureInterface>(data);
    },

    updateHandler: async (id: string, payload: UpdateFeaturePayloadInterface): Promise<FeatureInterface> => {
        const { data } = await apiClient.put(apisData.features.update(id), payload);
        return unwrap<FeatureInterface>(data);
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.features.delete(id));
    },

    linkTasksHandler: async (id: string, taskIds: string[]): Promise<FeatureInterface> => {
        const { data } = await apiClient.post(apisData.features.linkTasks(id), { task_ids: taskIds });
        return unwrap<FeatureInterface>(data);
    },

    unlinkTaskHandler: async (id: string, taskId: string): Promise<void> => {
        await apiClient.delete(apisData.features.unlinkTask(id, taskId));
    },
};
