import { useState } from "react";

import { handoffsConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { handoffsService } from "@/services";

export const useDeleteHandoffCriteria = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await handoffsService.criteriaDeleteHandler(id);
                return true;
            }, {
                errorFallback: handoffsConstants.errors.criteriaDeleteFailed,
                successMessage: handoffsConstants.messages.criteriaDeleted,
                context: "handoffs.criteria.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
