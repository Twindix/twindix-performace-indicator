import { timeConstants } from "@/constants";
import type { TimeAggregationResponseInterface, TimeByProjectRowInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeByProject = () => {
    const { data, isLoading, refetch } = useQueryAction<TimeAggregationResponseInterface<TimeByProjectRowInterface> | null>(
        () => timeService.byProjectHandler(),
        [],
        {
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.byProject",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], summary: data?.summary ?? null, isLoading, refetch };
};
