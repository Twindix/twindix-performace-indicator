import { timeConstants } from "@/constants";
import type { TimeAggregationResponseInterface, TimeBySprintRowInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeBySprint = () => {
    const { data, isLoading, refetch } = useQueryAction<TimeAggregationResponseInterface<TimeBySprintRowInterface> | null>(
        () => timeService.bySprintHandler(),
        [],
        {
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.bySprint",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], summary: data?.summary ?? null, isLoading, refetch };
};
