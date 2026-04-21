import { apiClient } from "@/lib/axios";
import { apisData } from "@/data/apis";
import type { CreateUserPayloadInterface, UpdateUserPayloadInterface, UserAnalyticsInterface, UserInterface } from "@/interfaces";

export const usersService = {
    listHandler: async (): Promise<UserInterface[]> => {
        const res = await apiClient.get(apisData.users.list);
        return res.data.data ?? res.data;
    },

    detailHandler: async (id: string): Promise<UserInterface> => {
        const res = await apiClient.get(apisData.users.detail(id));
        return res.data.data ?? res.data;
    },

    analyticsHandler: async (id: string): Promise<UserAnalyticsInterface> => {
        const res = await apiClient.get(apisData.users.analytics(id));
        return res.data.data ?? res.data;
    },

    createHandler: async (payload: CreateUserPayloadInterface): Promise<UserInterface> => {
        const res = await apiClient.post(apisData.users.create, payload);
        return res.data.data ?? res.data;
    },

    updateHandler: async (id: string, payload: UpdateUserPayloadInterface): Promise<UserInterface> => {
        const res = await apiClient.put(apisData.users.update(id), payload);
        return res.data.data ?? res.data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.users.delete(id));
    },
};
