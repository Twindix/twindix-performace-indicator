import { timeConstants } from "@/constants";
import type { TimeSummaryInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeSummary = () => {
    const { data, isLoading, refetch } = useQueryAction<TimeSummaryInterface | null>(
        () => timeService.summaryHandler(),
        [],
        {
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.summary",
            initialData: null,
        },
    );
    return { summary: data ?? null, isLoading, refetch };
};
