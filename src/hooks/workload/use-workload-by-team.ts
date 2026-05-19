import { workloadConstants } from "@/constants";
import type { WorkloadUserRowInterface } from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadByTeam = (sprintId: string) => {
    const { data, isLoading, refetch } = useQueryAction<WorkloadUserRowInterface[] | null>(
        () => workloadService.bySprintHandler(sprintId),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.byTeam",
            initialData: null,
        },
    );
    return { rows: data ?? [], isLoading, refetch };
};
