import { useState } from "react";

import { deploysConstants } from "@/constants";
import type { DeployInterface, UpdateDeployStatusPayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { deploysService } from "@/services";

export const useUpdateDeployStatus = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateStatusHandler = async (id: string, payload: UpdateDeployStatusPayloadInterface): Promise<DeployInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => deploysService.updateStatusHandler(id, payload), {
                errorFallback: deploysConstants.errors.updateStatusFailed,
                successMessage: deploysConstants.messages.updateStatusSuccess,
                context: "deploys.updateStatus",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { updateStatusHandler, isLoading };
};
