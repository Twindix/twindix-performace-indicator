import { apisData } from "@/data";
import type { LoginResponseInterface, MeResponseInterface, RefreshResponseInterface, UserInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const authService = {
    loginHandler: async (email: string, password: string): Promise<LoginResponseInterface> => {
        const { data } = await apiClient.post<LoginResponseInterface>(apisData.auth.login, {
            email,
            password,
        });
        return data;
    },

    logoutHandler: async (): Promise<void> => {
        await apiClient.post(apisData.auth.logout);
    },

    refreshHandler: async (): Promise<RefreshResponseInterface> => {
        const { data } = await apiClient.post<RefreshResponseInterface>(apisData.auth.refresh);
        return data;
    },

    meHandler: async (): Promise<UserInterface> => {
        const { data } = await apiClient.get<MeResponseInterface>(apisData.auth.me);
        return data.data;
    },

    updateMeHandler: async (updates: Partial<Pick<UserInterface, "full_name" | "presence_status" | "settings">>): Promise<UserInterface> => {
        const { data } = await apiClient.put<MeResponseInterface>(apisData.auth.me, updates);
        return data.data;
    },

    heartbeatHandler: async (): Promise<void> => {
        await apiClient.patch(apisData.auth.heartbeat).catch(() => {});
    },
};
