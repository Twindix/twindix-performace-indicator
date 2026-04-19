import { useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import type { DecisionInterface, UpdateDecisionPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

export const useUpdateDecision = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateDecisionPayloadInterface): Promise<DecisionInterface | null> => {
        if (!navigator.onLine) throw new Error(decisionsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await decisionsService.updateHandler(id, payload);
            toast.success(decisionsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
