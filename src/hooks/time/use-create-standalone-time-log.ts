import { useState } from "react";

import { timeConstants } from "@/constants";
import type { CreateStandaloneTimeLogPayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { timeLogsService } from "@/services";

export const useCreateStandaloneTimeLog = (options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateStandaloneTimeLogPayloadInterface) => {
        setIsLoading(true);
        try {
            return await runAction(() => timeLogsService.createStandaloneHandler(payload), {
                errorFallback: timeConstants.errors.logFailed,
                successMessage: timeConstants.messages.logSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "time-logs.createStandalone",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
