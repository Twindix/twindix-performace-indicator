import { useState } from "react";

import { handoffsConstants } from "@/constants";
import type { HandoffTaskStatusInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { handoffsService } from "@/services";

export const useToggleHandoffCheck = () => {
    const [isLoading, setIsLoading] = useState(false);

    const toggleHandler = async (taskId: string, criteriaId: string): Promise<HandoffTaskStatusInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => handoffsService.toggleCheckHandler(taskId, criteriaId), {
                errorFallback: handoffsConstants.errors.toggleFailed,
                context: "handoffs.toggleCheck",
                silent: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { toggleHandler, isLoading };
};
