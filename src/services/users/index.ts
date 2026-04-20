import { apiClient } from "@/lib/axios";
import { apisData } from "@/data/apis";
import type { UserInterface } from "@/interfaces";

export const usersService = {
    listHandler: async (): Promise<UserInterface[]> => {
        const res = await apiClient.get(apisData.users.list);
        return res.data.data ?? res.data;
    },
};
