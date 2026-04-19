import { apisData } from "@/data";
import type { CreateRedFlagPayloadInterface, RedFlagDetailResponseInterface, RedFlagsCountResponseInterface, RedFlagsListFiltersInterface, RedFlagsListResponseInterface, UpdateRedFlagPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const redFlagsService = {
    listHandler: async (sprintId: string, filters?: RedFlagsListFiltersInterface): Promise<RedFlagsListResponseInterface> => {
        const { data } = await apiClient.get<RedFlagsListResponseInterface>(apisData.redFlags.list(sprintId), { params: filters });
        return data;
    },

    countHandler: async (sprintId: string): Promise<RedFlagsCountResponseInterface> => {
        const { data } = await apiClient.get<RedFlagsCountResponseInterface>(apisData.redFlags.count(sprintId));
        return data;
    },

    detailHandler: async (id: string): Promise<RedFlagDetailResponseInterface> => {
        const { data } = await apiClient.get<RedFlagDetailResponseInterface>(apisData.redFlags.detail(id));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateRedFlagPayloadInterface): Promise<RedFlagDetailResponseInterface> => {
        const { data } = await apiClient.post<RedFlagDetailResponseInterface>(apisData.redFlags.create(sprintId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateRedFlagPayloadInterface): Promise<RedFlagDetailResponseInterface> => {
        const { data } = await apiClient.put<RedFlagDetailResponseInterface>(apisData.redFlags.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.redFlags.delete(id));
    },
};
