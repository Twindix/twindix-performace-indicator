import { workloadConstants } from "@/constants";
import type { WorkloadUserRowInterface } from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadByProject = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<WorkloadUserRowInterface[] | null>(
        () => workloadService.byProjectHandler(projectId),
        [projectId],
        {
            enabled: !!projectId,
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.byProject",
            initialData: null,
        },
    );
    return { rows: data ?? [], isLoading, refetch };
};
