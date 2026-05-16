import { projectsConstants } from "@/constants";
import type { ProjectAnalyticsResponseInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectAnalytics = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<ProjectAnalyticsResponseInterface | null>(
        () => projectsService.analyticsHandler(projectId),
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
