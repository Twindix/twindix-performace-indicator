import { timeConstants } from "@/constants";
import type { TaskTimeTrackingResponseInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeTrackingByTask = (taskId: string) => {
    const { data, isLoading, refetch } = useQueryAction<TaskTimeTrackingResponseInterface | null>(
        () => timeService.byTaskHandler(taskId),
        [taskId],
        {
            enabled: !!taskId,
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.byTask",
            initialData: null,
        },
    );
    return { data: data ?? null, isLoading, refetch };
};
