import { remindersConstants } from "@/constants";
import type { RemindersStatsInterface } from "@/interfaces";
import { remindersService } from "@/services";

import { useQueryAction } from "../shared";

export const useRemindersStats = () => {
    const { data, isLoading, refetch } = useQueryAction<RemindersStatsInterface | null>(
        () => remindersService.statsHandler(),
        [],
        {
            errorFallback: remindersConstants.errors.statsFailed,
            context: "reminders.stats",
            initialData: null,
        },
    );
    return { stats: data ?? null, isLoading, refetch };
};
