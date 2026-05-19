import { workloadConstants } from "@/constants";
import type { WorkloadUserRowInterface } from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadByUser = (userId: string) => {
    const { data, isLoading, refetch } = useQueryAction<WorkloadUserRowInterface[] | null>(
        () => workloadService.byUserHandler(userId),
        [userId],
        {
            enabled: !!userId,
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.byUser",
            initialData: null,
        },
    );
    return { rows: data ?? [], isLoading, refetch };
};
