import { teamsConstants } from "@/constants";
import type { TeamLiteInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { useQueryAction } from "../shared";

export const useTeamsListLite = () => {
    const { data, isLoading, refetch } = useQueryAction<TeamLiteInterface[]>(
        () => teamsService.listLiteHandler(),
        [],
        {
            errorFallback: teamsConstants.errors.fetchFailed,
            initialData: [],
            context: "teams.listLite",
        },
    );

    return { teams: data ?? [], isLoading, refetch };
};
