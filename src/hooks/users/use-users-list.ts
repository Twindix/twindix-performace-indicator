import { useCallback, useEffect, useState } from "react";

import { apisData } from "@/data";
import type { UserInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const useUsersList = () => {
    const [users, setUsers] = useState<UserInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await apiClient.get<{ data: UserInterface[] }>(apisData.users.list);
            setUsers(data.data);
        } catch {
            // silent — users list is UI-only helper
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { users, isLoading };
};
