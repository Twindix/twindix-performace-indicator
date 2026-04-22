import { decisionsConstants } from "@/constants";
import type { DecisionsAnalyticsInterface } from "@/interfaces";
import { decisionsService } from "@/services";

import { useQueryAction } from "../shared";

export const useDecisionsAnalytics = (sprintId: string) => {
    const { data, isLoading, refetch } = useQueryAction<DecisionsAnalyticsInterface | null>(
        async () => (sprintId ? await decisionsService.analyticsHandler(sprintId) : null),
        [sprintId],
        {
            enabled: !!sprintId,
            silent: true,
            errorFallback: decisionsConstants.errors.fetchAnalyticsFailed,
            initialData: null,
            context: "decisions.analytics",
        },
    );

    return { analytics: data ?? null, isLoading, refetch };
};
