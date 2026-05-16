import { useState } from "react";

import { handoffsConstants } from "@/constants";
import type { CreateHandoffCriteriaPayloadInterface, HandoffCriteriaSeedInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { handoffsService } from "@/services";

export const useCreateHandoffCriteria = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateHandoffCriteriaPayloadInterface): Promise<HandoffCriteriaSeedInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => handoffsService.criteriaCreateHandler(payload), {
                errorFallback: handoffsConstants.errors.criteriaCreateFailed,
                successMessage: handoffsConstants.messages.criteriaCreated,
                context: "handoffs.criteria.create",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
