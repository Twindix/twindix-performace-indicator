import { useState } from "react";

import { handoffsConstants } from "@/constants";
import type { HandoffCriteriaSeedInterface, UpdateHandoffCriteriaPayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { handoffsService } from "@/services";

export const useUpdateHandoffCriteria = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateHandoffCriteriaPayloadInterface): Promise<HandoffCriteriaSeedInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => handoffsService.criteriaUpdateHandler(id, payload), {
                errorFallback: handoffsConstants.errors.criteriaUpdateFailed,
                successMessage: handoffsConstants.messages.criteriaUpdated,
                context: "handoffs.criteria.update",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
