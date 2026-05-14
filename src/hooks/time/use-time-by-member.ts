import { timeConstants } from "@/constants";
import type { TimeAggregationResponseInterface, TimeByMemberRowInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeByMember = () => {
    const { data, isLoading, refetch } = useQueryAction<TimeAggregationResponseInterface<TimeByMemberRowInterface> | null>(
        () => timeService.byMemberHandler(),
        [],
        {
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.byMember",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], summary: data?.summary ?? null, isLoading, refetch };
};
