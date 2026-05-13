import { useCallback } from "react";

import { usersConstants } from "@/constants";
import type { RoleTier } from "@/constants/permissions";
import type { UserInterface } from "@/interfaces";
import { usersService } from "@/services/users";

import { usePaginatedQuery } from "../shared";

export interface UseUsersListOptions {
    role_tier?: RoleTier;
    team_id?: string;
    initialPerPage?: number;
}

export const useUsersList = (options: UseUsersListOptions = {}) => {
    const { role_tier, team_id, initialPerPage } = options;

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<UserInterface>(
        ({ page, per_page }) => usersService.listHandler({ page, per_page, role_tier, team_id }),
        [role_tier, team_id],
        {
            errorFallback: usersConstants.errors.fetchFailed,
            context: "users.list",
            initialPerPage,
        },
    );

    const patchUserLocal = useCallback((updated: UserInterface) => {
        setItems((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    }, [setItems]);

    const prependUserLocal = useCallback((created: UserInterface) => {
        setItems((prev) => [created, ...prev]);
    }, [setItems]);

    const removeUserLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((u) => u.id !== id));
    }, [setItems]);

    return { users: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchUserLocal, prependUserLocal, removeUserLocal };
};
