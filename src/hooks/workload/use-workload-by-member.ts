import { workloadConstants } from "@/constants";
import type {
    WorkloadByMemberRowInterface,
    WorkloadMemberFiltersInterface,
    WorkloadResponseInterface,
} from "@/interfaces";
import { workloadService } from "@/services";

import { useQueryAction } from "../shared";

export const useWorkloadByMember = (filters?: WorkloadMemberFiltersInterface) => {
    const sprintId = filters?.sprint_id;
    const { data, isLoading, refetch } = useQueryAction<WorkloadResponseInterface<WorkloadByMemberRowInterface> | null>(
        () => workloadService.byMemberHandler({ sprint_id: sprintId }),
        [sprintId],
        {
            errorFallback: workloadConstants.errors.fetchFailed,
            context: "workload.byMember",
            initialData: null,
        },
    );
    return { rows: data?.data ?? [], isLoading, refetch };
};
