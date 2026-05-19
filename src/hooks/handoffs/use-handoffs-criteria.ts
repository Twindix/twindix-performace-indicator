import { handoffsConstants } from "@/constants";
import type { HandoffCriteriaSeedInterface } from "@/interfaces";
import { handoffsService } from "@/services";

import { useQueryAction } from "../shared";

export const useHandoffsCriteria = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<HandoffCriteriaSeedInterface[] | null>(
        () => handoffsService.criteriaListHandler(projectId),
        [projectId],
        {
            enabled: !!projectId,
            errorFallback: handoffsConstants.errors.criteriaListFailed,
            context: "handoffs.criteria",
            initialData: null,
        },
    );
    return { criteria: data ?? [], isLoading, refetch };
};
