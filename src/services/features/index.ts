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

const normalizeFeature = (raw: any): FeatureInterface => ({
    id: raw.id,
    title: raw.title,
    description: raw.description ?? null,
    status: raw.status,
    priority: raw.priority ?? null,
    project_id: raw.project_id,
    created_by: raw.creator
        ? { id: raw.creator.id, name: raw.creator.full_name ?? raw.creator.name ?? "" }
        : raw.created_by ?? null,
    linked_tasks_count: Array.isArray(raw.tasks) ? raw.tasks.length : (raw.linked_tasks_count ?? 0),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
});

export const featuresService = {
    listHandler: async (projectId: string, filters?: FeaturesListFiltersInterface): Promise<FeaturesListResponseInterface> => {
        const { data } = await apiClient.get<any>(apisData.features.list(projectId), { params: filters });
        return { ...data, data: (data.data ?? []).map(normalizeFeature) };
    },

    detailHandler: async (id: string): Promise<FeatureInterface> => {
        const { data } = await apiClient.get(apisData.features.detail(id));
        return normalizeFeature(unwrap<any>(data));
    },

    createHandler: async (projectId: string, payload: CreateFeaturePayloadInterface): Promise<FeatureInterface> => {
        const { project_id: _pid, ...body } = payload;
        const { data } = await apiClient.post(apisData.features.create(projectId), body);
        return normalizeFeature(unwrap<any>(data));
    },

    updateHandler: async (id: string, payload: UpdateFeaturePayloadInterface): Promise<FeatureInterface> => {
        const { project_id: _pid, ...body } = payload;
        const { data } = await apiClient.put(apisData.features.update(id), body);
        return normalizeFeature(unwrap<any>(data));
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
