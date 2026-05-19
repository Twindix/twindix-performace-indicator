import { sprintsConstants } from "@/constants";
import type { SprintAnalyticsResponseInterface } from "@/interfaces";
import { analyticsCache } from "@/lib/analytics-cache";
import { sprintsService } from "@/services";

import { useQueryAction } from "../shared";

export const useSprintAnalytics = (sprintId: string) => {
    const { data, isLoading, refetch } = useQueryAction<SprintAnalyticsResponseInterface | null>(
        async () => {
            const key = `sprint-analytics:${sprintId}`;
            const cached = analyticsCache.get<SprintAnalyticsResponseInterface>(key);
            if (cached) return cached;
            const result = await sprintsService.analyticsHandler(sprintId);
            analyticsCache.set(key, result);
            return result;
        },
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: sprintsConstants.errors.fetchFailed,
            context: "sprints.analytics",
            initialData: null,
        },
    );
    return { analytics: data ?? null, isLoading, refetch };
};
