import { useState } from "react";

import { deploysConstants } from "@/constants";
import type { DeployInterface, UploadDeployPayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { deploysService } from "@/services";

export const useUploadDeploy = (options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadHandler = async (payload: UploadDeployPayloadInterface): Promise<DeployInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => deploysService.createHandler(payload), {
                errorFallback: deploysConstants.errors.createFailed,
                successMessage: deploysConstants.messages.createSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "deploys.create",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { uploadHandler, isLoading };
};
