import { timeConstants } from "@/constants";
import type { UserTimeTrackingResponseInterface } from "@/interfaces";
import { timeService } from "@/services";

import { useQueryAction } from "../shared";

export const useTimeTrackingByUser = (userId: string) => {
    const { data, isLoading, refetch } = useQueryAction<UserTimeTrackingResponseInterface | null>(
        () => timeService.byUserHandler(userId),
        [userId],
        {
            enabled: !!userId,
            errorFallback: timeConstants.errors.fetchFailed,
            context: "time.byUser",
            initialData: null,
        },
    );
    return { data: data ?? null, isLoading, refetch };
};
