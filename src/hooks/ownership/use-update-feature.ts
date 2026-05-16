import { useState } from "react";

import { featuresConstants } from "@/constants";
import type { FeatureInterface, UpdateFeaturePayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { featuresService } from "@/services";

export const useUpdateFeature = (options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateFeaturePayloadInterface): Promise<FeatureInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => featuresService.updateHandler(id, payload), {
                errorFallback: featuresConstants.errors.updateFailed,
                successMessage: featuresConstants.messages.updateSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "features.update",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
