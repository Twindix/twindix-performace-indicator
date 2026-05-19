import { useState } from "react";

import { handoffsConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { handoffsService } from "@/services";

export const useToggleHandoffCheck = () => {
    const [isLoading, setIsLoading] = useState(false);

    const checkHandler = async (criteriaId: string, sprintId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await runAction(() => handoffsService.checkHandler(criteriaId, sprintId), {
                errorFallback: handoffsConstants.errors.toggleFailed,
                context: "handoffs.check",
                silent: true,
            });
            return true;
        } finally {
            setIsLoading(false);
        }
    };

    const uncheckHandler = async (criteriaId: string, sprintId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await runAction(() => handoffsService.uncheckHandler(criteriaId, sprintId), {
                errorFallback: handoffsConstants.errors.toggleFailed,
                context: "handoffs.uncheck",
                silent: true,
            });
            return true;
        } finally {
            setIsLoading(false);
        }
    };

    return { checkHandler, uncheckHandler, isLoading };
};
