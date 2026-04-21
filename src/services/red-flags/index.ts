import { apisData } from "@/data";
import type { CreateRedFlagPayloadInterface, RedFlagDetailResponseInterface, RedFlagsCountInterface, RedFlagsListResponseInterface, UpdateRedFlagPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const redFlagsService = {
    listHandler: async (sprintId: string): Promise<RedFlagsListResponseInterface> => {
        const { data } = await apiClient.get<RedFlagsListResponseInterface>(apisData.redFlags.list(sprintId));
        return data;
    },

    countHandler: async (sprintId: string): Promise<RedFlagsCountInterface> => {
        const { data } = await apiClient.get<RedFlagsCountInterface>(apisData.redFlags.count(sprintId));
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
