import { workloadConstants } from "@/constants";
import type { WorkloadByTeamRowInterface, WorkloadResponseInterface } from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadByTeam = () => {
    const { data, isLoading, refetch } = useQueryAction<WorkloadResponseInterface<WorkloadByTeamRowInterface> | null>(
        () => workloadService.byTeamHandler(),
        [],
        {
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.byTeam",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], isLoading, refetch };
};
