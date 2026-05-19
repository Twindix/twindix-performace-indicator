import { useState } from "react";

import { featuresConstants } from "@/constants";
import type { CreateFeaturePayloadInterface, FeatureInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { featuresService } from "@/services";

export const useCreateFeature = (projectId: string, options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateFeaturePayloadInterface): Promise<FeatureInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => featuresService.createHandler(projectId, payload), {
                errorFallback: featuresConstants.errors.createFailed,
                successMessage: featuresConstants.messages.createSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "features.create",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
