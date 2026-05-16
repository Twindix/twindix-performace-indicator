import { workloadConstants } from "@/constants";
import type { WorkloadBySprintRowInterface, WorkloadResponseInterface } from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadBySprint = () => {
    const { data, isLoading, refetch } = useQueryAction<WorkloadResponseInterface<WorkloadBySprintRowInterface> | null>(
        () => workloadService.bySprintHandler(),
        [],
        {
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.bySprint",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], isLoading, refetch };
};
