import { useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import type { CreateDecisionPayloadInterface, DecisionInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

export const useCreateDecision = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (sprintId: string, payload: CreateDecisionPayloadInterface): Promise<DecisionInterface | null> => {
        setIsLoading(true);
        try {
            const res = await decisionsService.createHandler(sprintId, payload);
            toast.success(decisionsConstants.messages.createSuccess);
            return (res as unknown as { data?: DecisionInterface }).data ?? (res as unknown as DecisionInterface);
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
