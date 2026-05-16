import { teamsConstants } from "@/constants";
import type { TeamLiteInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { useSessionCachedList } from "../shared";

export const useTeamsListLite = () => {
    const { data, isLoading, refetch } = useSessionCachedList<TeamLiteInterface>(
        "teams.lite",
        () => teamsService.listLiteHandler(),
        { errorFallback: teamsConstants.errors.fetchFailed, context: "teams.listLite" },
    );
    return { teams: data, isLoading, refetch };
};
