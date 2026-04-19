import { apisData } from "@/data";
import type { CreateRequirementPayloadInterface, RequirementDetailResponseInterface, RequirementsListResponseInterface, UpdateRequirementPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const requirementsService = {
    listHandler: async (taskId: string): Promise<RequirementsListResponseInterface> => {
        const { data } = await apiClient.get<RequirementsListResponseInterface>(apisData.requirements.list(taskId));
        return data;
    },

    createHandler: async (taskId: string, payload: CreateRequirementPayloadInterface): Promise<RequirementDetailResponseInterface> => {
        const { data } = await apiClient.post<RequirementDetailResponseInterface>(apisData.requirements.create(taskId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateRequirementPayloadInterface): Promise<RequirementDetailResponseInterface> => {
        const { data } = await apiClient.put<RequirementDetailResponseInterface>(apisData.requirements.update(id), payload);
        return data;
    },

    toggleHandler: async (id: string): Promise<RequirementDetailResponseInterface> => {
        const { data } = await apiClient.patch<RequirementDetailResponseInterface>(apisData.requirements.toggle(id));
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.requirements.delete(id));
    },
};
