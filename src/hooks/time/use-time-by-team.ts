import { timeConstants } from "@/constants";
import type { TimeAggregationResponseInterface, TimeByTeamRowInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeByTeam = () => {
    const { data, isLoading, refetch } = useQueryAction<TimeAggregationResponseInterface<TimeByTeamRowInterface> | null>(
        () => timeService.byTeamHandler(),
        [],
        {
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.byTeam",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], summary: data?.summary ?? null, isLoading, refetch };
};
