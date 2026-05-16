import { apisData } from "@/data";
import type {
    CreateHandoffCriteriaPayloadInterface,
    HandoffCriteriaSeedInterface,
    HandoffTaskStatusInterface,
    HandoffsFiltersInterface,
    HandoffsResponseInterface,
    UpdateHandoffCriteriaPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const handoffsService = {
    overviewHandler: async (filters?: HandoffsFiltersInterface): Promise<HandoffsResponseInterface> => {
        const { data } = await apiClient.get<HandoffsResponseInterface>(apisData.handoffs.overview, {
            params: filters,
        });
        return data;
    },

    criteriaListHandler: async (): Promise<HandoffCriteriaSeedInterface[]> => {
        const { data } = await apiClient.get<HandoffCriteriaSeedInterface[] | { data: HandoffCriteriaSeedInterface[] }>(
            apisData.handoffs.criteria,
        );
        return Array.isArray(data) ? data : (data.data ?? []);
    },

    criteriaCreateHandler: async (payload: CreateHandoffCriteriaPayloadInterface): Promise<HandoffCriteriaSeedInterface> => {
        const { data } = await apiClient.post<HandoffCriteriaSeedInterface | { data: HandoffCriteriaSeedInterface }>(
            apisData.handoffs.criteriaCreate,
            payload,
        );
        return "data" in (data as object) ? (data as { data: HandoffCriteriaSeedInterface }).data : (data as HandoffCriteriaSeedInterface);
    },

    criteriaUpdateHandler: async (id: string, payload: UpdateHandoffCriteriaPayloadInterface): Promise<HandoffCriteriaSeedInterface> => {
        const { data } = await apiClient.put<HandoffCriteriaSeedInterface | { data: HandoffCriteriaSeedInterface }>(
            apisData.handoffs.criteriaUpdate(id),
            payload,
        );
        return "data" in (data as object) ? (data as { data: HandoffCriteriaSeedInterface }).data : (data as HandoffCriteriaSeedInterface);
    },

    criteriaDeleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.handoffs.criteriaDelete(id));
    },

    toggleCheckHandler: async (taskId: string, criteriaId: string): Promise<HandoffTaskStatusInterface> => {
        const { data } = await apiClient.patch<HandoffTaskStatusInterface | { data: HandoffTaskStatusInterface }>(
            apisData.handoffs.toggleCheck(taskId, criteriaId),
        );
        return "data" in (data as object) ? (data as { data: HandoffTaskStatusInterface }).data : (data as HandoffTaskStatusInterface);
    },

    taskStatusHandler: async (taskId: string): Promise<HandoffTaskStatusInterface> => {
        const { data } = await apiClient.get<HandoffTaskStatusInterface | { data: HandoffTaskStatusInterface }>(
            apisData.handoffs.taskStatus(taskId),
        );
        return "data" in (data as object) ? (data as { data: HandoffTaskStatusInterface }).data : (data as HandoffTaskStatusInterface);
    },
};
