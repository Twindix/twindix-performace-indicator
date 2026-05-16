import { sprintsConstants } from "@/constants";
import type { SprintAnalyticsResponseInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useQueryAction } from "../shared";

export const useSprintAnalytics = (sprintId: string) => {
    const { data, isLoading, refetch } = useQueryAction<SprintAnalyticsResponseInterface | null>(
        () => sprintsService.analyticsHandler(sprintId),
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
