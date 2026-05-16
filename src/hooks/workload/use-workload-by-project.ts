import { workloadConstants } from "@/constants";
import type { WorkloadByProjectRowInterface, WorkloadResponseInterface } from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadByProject = () => {
    const { data, isLoading, refetch } = useQueryAction<WorkloadResponseInterface<WorkloadByProjectRowInterface> | null>(
        () => workloadService.byProjectHandler(),
        [],
        {
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.byProject",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], isLoading, refetch };
};
