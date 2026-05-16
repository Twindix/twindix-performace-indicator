import { reportsConstants } from "@/constants";
import type { ProjectReportResponseInterface } from "@/interfaces";
import { reportsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectReport = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<ProjectReportResponseInterface | null>(
        () => reportsService.fullHandler(projectId),
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
