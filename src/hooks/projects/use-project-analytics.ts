import { projectsConstants } from "@/constants";
import type { ProjectAnalyticsResponseInterface } from "@/interfaces";
import { analyticsCache } from "@/lib/analytics-cache";
import { projectsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectAnalytics = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<ProjectAnalyticsResponseInterface | null>(
        async () => {
            const key = `project-analytics:${projectId}`;
            const cached = analyticsCache.get<ProjectAnalyticsResponseInterface>(key);
            if (cached) return cached;
            const result = await projectsService.analyticsHandler(projectId);
            analyticsCache.set(key, result);
            return result;
        },
        [projectId],
        {
            enabled: !!projectId,
            errorFallback: projectsConstants.errors.fetchFailed,
            context: "projects.analytics",
            initialData: null,
        },
    );
    return { analytics: data ?? null, isLoading, refetch };
};
