import { useCallback, useEffect, useState } from "react";

import type { UserInterface } from "@/interfaces/common";
import type { UserListParamsInterface, UserPaginationMetaInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

interface UsersListState {
    users: UserInterface[];
    meta: UserPaginationMetaInterface | null;
    isLoading: boolean;
    error: string | null;
}

export const useUsersList = (params?: UserListParamsInterface) => {
    const [state, setState] = useState<UsersListState>({
        users: [],
        meta: null,
        isLoading: true,
        error: null,
    });

    const fetch = useCallback(async (fetchParams?: UserListParamsInterface) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await usersService.listHandler(fetchParams ?? params);
            setState({ users: response.data, meta: response.meta, isLoading: false, error: null });
        } catch {
            setState((prev) => ({ ...prev, isLoading: false, error: "Failed to load users" }));
        }
    }, [params]);

    useEffect(() => { fetch(); }, [fetch]);

    return { ...state, refetch: fetch };
};
