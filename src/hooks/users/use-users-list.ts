import { useCallback } from "react";

import { usersConstants } from "@/constants";
import type { RoleTier } from "@/constants/permissions";
import type { UserInterface, UsersListSortInterface } from "@/interfaces";
import { usersService } from "@/services/users";

import { usePaginatedQuery } from "../shared";

export interface UseUsersListOptions {
    search?: string;
    role_tier?: RoleTier;
    team_id?: string;
    project_id?: string;
    status?: "active" | "inactive";
    sort?: UsersListSortInterface;
    initialPerPage?: number;
}

export const useUsersList = (options: UseUsersListOptions = {}) => {
    const { search, role_tier, team_id, project_id, status, sort, initialPerPage } = options;

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<UserInterface>(
        ({ page, per_page }) => usersService.listHandler({ page, per_page, search, role_tier, team_id, project_id, status, sort }),
        [search, role_tier, team_id, project_id, status, sort],
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
