import { useCallback } from "react";

import { teamsConstants } from "@/constants";
import type { TeamInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { useQueryAction } from "../shared";

export const useGetTeams = () => {
    const { data, isLoading, refetch, setData } = useQueryAction<TeamInterface[]>(
        async () => (await teamsService.listHandler()).data,
        [],
        {
            errorFallback: teamsConstants.errors.fetchFailed,
            initialData: [],
            context: "teams.list",
        },
    );

    const patchTeamLocal = useCallback((team: TeamInterface) => {
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((t) => t.id === team.id);
            return exists ? arr.map((t) => (t.id === team.id ? team : t)) : [...arr, team];
        });
    }, [setData]);

    const removeTeamLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((t) => t.id !== id));
    }, [setData]);

    return { teams: data ?? [], isLoading, refetch, patchTeamLocal, removeTeamLocal };
};
