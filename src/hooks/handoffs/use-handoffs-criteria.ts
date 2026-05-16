import { handoffsConstants } from "@/constants";
import type { HandoffCriteriaSeedInterface } from "@/interfaces";
import { handoffsService } from "@/services";

import { useQueryAction } from "../shared";

export const useHandoffsCriteria = () => {
    const { data, isLoading, refetch } = useQueryAction<HandoffCriteriaSeedInterface[] | null>(
        () => handoffsService.criteriaListHandler(),
        [],
        {
            errorFallback: handoffsConstants.errors.criteriaListFailed,
            context: "handoffs.criteria",
            initialData: null,
        },
    );
    return { criteria: data ?? [], isLoading, refetch };
};
