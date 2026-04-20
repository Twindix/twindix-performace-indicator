import { apisData } from "@/data";
import type { UserInterface } from "@/interfaces/common";
import type {
    CreateUserPayloadInterface,
    UpdateUserPayloadInterface,
    UserAnalyticsInterface,
    UserListParamsInterface,
    UserListResponseInterface,
} from "@/interfaces/users";
import { apiClient } from "@/lib/axios";

export const usersService = {
    listHandler: async (params?: UserListParamsInterface): Promise<UserListResponseInterface> => {
        const { data } = await apiClient.get<UserListResponseInterface>(apisData.users.list, { params });
        return data;
    },

    detailHandler: async (id: string): Promise<UserInterface> => {
        const { data } = await apiClient.get<{ data: UserInterface }>(apisData.users.detail(id));
        return data.data;
    },

    createHandler: async (payload: CreateUserPayloadInterface): Promise<UserInterface> => {
        const { data } = await apiClient.post<{ data: UserInterface }>(apisData.users.create, payload);
        return data.data;
    },

    updateHandler: async (id: string, payload: UpdateUserPayloadInterface): Promise<UserInterface> => {
        const { data } = await apiClient.put<{ data: UserInterface }>(apisData.users.update(id), payload);
        return data.data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.users.delete(id));
    },

    analyticsHandler: async (id: string, sprintId?: string): Promise<UserAnalyticsInterface> => {
        const params = sprintId ? { sprint_id: sprintId } : undefined;
        const { data } = await apiClient.get<UserAnalyticsInterface>(apisData.users.analytics(id), { params });
        return data;
    },
};
