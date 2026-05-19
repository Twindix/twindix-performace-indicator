import { reportsConstants } from "@/constants";
import type { ProjectReportResponseInterface } from "@/interfaces";
import { analyticsCache } from "@/lib/analytics-cache";
import { reportsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectReport = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<ProjectReportResponseInterface | null>(
        async () => {
            const key = `project-report:${projectId}`;
            const cached = analyticsCache.get<ProjectReportResponseInterface>(key);
            if (cached) return cached;
            const result = await reportsService.fullHandler(projectId);
            analyticsCache.set(key, result);
            return result;
        },
        [projectId],
        {
            enabled: !!projectId,
            errorFallback: reportsConstants.errors.fetchFailed,
            context: "reports.full",
            initialData: null,
        },
    );
    return { report: data ?? null, isLoading, refetch };
};
