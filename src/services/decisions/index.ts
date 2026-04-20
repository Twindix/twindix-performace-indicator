import { apisData } from "@/data";
import type {
    CreateDecisionPayloadInterface,
    DecisionDetailResponseInterface,
    DecisionsAnalyticsInterface,
    DecisionsListFiltersInterface,
    DecisionsListResponseInterface,
    UpdateDecisionPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const decisionsService = {
    listHandler: async (sprintId: string, filters?: DecisionsListFiltersInterface): Promise<DecisionsListResponseInterface> => {
        const { data } = await apiClient.get<DecisionsListResponseInterface>(apisData.decisions.list(sprintId), { params: filters });
        return data;
    },

    analyticsHandler: async (sprintId: string): Promise<DecisionsAnalyticsInterface> => {
        const { data } = await apiClient.get<DecisionsAnalyticsInterface>(apisData.decisions.analytics(sprintId));
        return data;
    },

    detailHandler: async (id: string): Promise<DecisionDetailResponseInterface> => {
        const { data } = await apiClient.get<DecisionDetailResponseInterface>(apisData.decisions.detail(id));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateDecisionPayloadInterface): Promise<DecisionDetailResponseInterface> => {
        const { data } = await apiClient.post<DecisionDetailResponseInterface>(apisData.decisions.create(sprintId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateDecisionPayloadInterface): Promise<DecisionDetailResponseInterface> => {
        const { data } = await apiClient.put<DecisionDetailResponseInterface>(apisData.decisions.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.decisions.delete(id));
    },
};
