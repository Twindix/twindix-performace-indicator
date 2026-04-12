import { apisData } from "@/data";
import type { LoginResponseInterface, MeResponseInterface, UserInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const authService = {
    loginHandler: async (email: string, password: string): Promise<LoginResponseInterface> => {
        const { data } = await apiClient.post<LoginResponseInterface>(apisData.auth.login, {
            email,
            password,
        });
        return data;
    },

    meHandler: async (): Promise<UserInterface> => {
        const { data } = await apiClient.get<MeResponseInterface>(apisData.auth.me);
        return data.data;
    },
};
