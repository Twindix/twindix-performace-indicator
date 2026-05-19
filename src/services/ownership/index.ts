import { apisData } from "@/data";
import type { FeatureInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

const extractList = (data: unknown): FeatureInterface[] => {
    if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        if (Array.isArray(d.data)) return d.data as FeatureInterface[];
        if (Array.isArray(data)) return data as FeatureInterface[];
    }
    return [];
};

export const ownershipService = {
    byProjectHandler: async (projectId: string): Promise<FeatureInterface[]> => {
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const { data } = await apiClient.get(apisData.ownership.byProject(projectId));
        return extractList(data);
    },

    bySprintHandler: async (sprintId: string): Promise<FeatureInterface[]> => {
        if (!sprintId) {
            throw new Error('Sprint ID is required');
        }
        const { data } = await apiClient.get(apisData.ownership.bySprint(sprintId));
        return extractList(data);
    },

    byUserHandler: async (userId: string): Promise<FeatureInterface[]> => {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const { data } = await apiClient.get(apisData.ownership.byUser(userId));
        return extractList(data);
    },

    byTaskHandler: async (taskId: string): Promise<FeatureInterface[]> => {
        if (!taskId) {
            throw new Error('Task ID is required');
        }
        const { data } = await apiClient.get(apisData.ownership.byTask(taskId));
        return extractList(data);
    },
};
