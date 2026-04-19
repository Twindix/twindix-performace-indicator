import { apisData } from "@/data";
import type { CreateUserPayloadInterface, UpdateProfilePayloadInterface, UpdateUserPayloadInterface, UserDetailResponseInterface, UserSettingsInterface, UserSettingsResponseInterface, UsersListFiltersInterface, UsersListResponseInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const usersService = {
    listHandler: async (filters?: UsersListFiltersInterface): Promise<UsersListResponseInterface> => {
        const { data } = await apiClient.get<UsersListResponseInterface>(apisData.users.list, { params: filters });
        return data;
    },

    detailHandler: async (id: string): Promise<UserDetailResponseInterface> => {
        const { data } = await apiClient.get<UserDetailResponseInterface>(apisData.users.detail(id));
        return data;
    },

    createHandler: async (payload: CreateUserPayloadInterface): Promise<UserDetailResponseInterface> => {
        const { data } = await apiClient.post<UserDetailResponseInterface>(apisData.users.create, payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateUserPayloadInterface): Promise<UserDetailResponseInterface> => {
        const { data } = await apiClient.put<UserDetailResponseInterface>(apisData.users.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.users.delete(id));
    },

    getMeSettingsHandler: async (): Promise<UserSettingsResponseInterface> => {
        const { data } = await apiClient.get<UserSettingsResponseInterface>(apisData.users.meSettings);
        return data;
    },

    updateMeSettingsHandler: async (payload: UserSettingsInterface): Promise<UserSettingsResponseInterface> => {
        const { data } = await apiClient.put<UserSettingsResponseInterface>(apisData.users.meSettings, payload);
        return data;
    },

    updateMeProfileHandler: async (payload: UpdateProfilePayloadInterface): Promise<UserDetailResponseInterface> => {
        const { data } = await apiClient.put<UserDetailResponseInterface>(apisData.users.meProfile, payload);
        return data;
    },
};
