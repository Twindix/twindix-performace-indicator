import { timeConstants } from "@/constants";
import type { SprintTimeTrackingResponseInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeBySprint = (sprintId: string) => {
    const { data, isLoading, refetch } = useQueryAction<SprintTimeTrackingResponseInterface | null>(
        () => timeService.bySprintHandler(sprintId),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.bySprint",
            initialData: null,
        },
    );
    return { data: data ?? null, isLoading, refetch };
};
