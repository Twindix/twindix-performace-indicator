import { apisData } from "@/data";
import type { CreateRequirementPayloadInterface, RequirementInterface, UpdateRequirementPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const requirementsService = {
    listHandler: async (taskId: string): Promise<{ data: RequirementInterface[] }> => {
        const { data } = await apiClient.get<{ data: RequirementInterface[] }>(apisData.requirements.list(taskId));
        return data;
    },

    getAllHandler: async (taskId: string): Promise<{ data: RequirementInterface[] }> => {
        const { data } = await apiClient.get<{ data: RequirementInterface[] }>(apisData.requirements.list(taskId));
        return data;
    },

    createHandler: async (taskId: string, payload: CreateRequirementPayloadInterface): Promise<{ data: RequirementInterface }> => {
        const { data } = await apiClient.post<{ data: RequirementInterface }>(apisData.requirements.create(taskId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateRequirementPayloadInterface): Promise<{ data: RequirementInterface }> => {
        const { data } = await apiClient.put<{ data: RequirementInterface }>(apisData.requirements.update(id), payload);
        return data;
    },

    toggleHandler: async (id: string): Promise<{ data: RequirementInterface }> => {
        const { data } = await apiClient.patch<{ data: RequirementInterface }>(apisData.requirements.toggle(id));
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.requirements.delete(id));
    },
};
