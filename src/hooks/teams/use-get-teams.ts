import { useCallback } from "react";

import { teamsConstants } from "@/constants";
import type { TeamInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { usePaginatedQuery } from "../shared";

export interface UseGetTeamsOptions {
    initialPerPage?: number;
}

export const useGetTeams = ({ initialPerPage }: UseGetTeamsOptions = {}) => {
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<TeamInterface>(
        ({ page, per_page }) => teamsService.listHandler({ page, per_page }),
        [],
        {
            errorFallback: teamsConstants.errors.fetchFailed,
            context: "teams.list",
            initialPerPage,
        },
    );

    const patchTeamLocal = useCallback((team: TeamInterface) => {
        setItems((prev) => {
            const exists = prev.some((t) => t.id === team.id);
            return exists ? prev.map((t) => (t.id === team.id ? team : t)) : [...prev, team];
        });
    }, [setItems]);

    const removeTeamLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((t) => t.id !== id));
    }, [setItems]);

    return { teams: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchTeamLocal, removeTeamLocal };
};
