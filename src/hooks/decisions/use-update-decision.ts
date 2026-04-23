import { decisionsConstants } from "@/constants";
import type { DecisionInterface, UpdateDecisionPayloadInterface } from "@/interfaces";
import { decisionsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateDecisionOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateDecision = ({ onFieldErrors }: UseUpdateDecisionOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateDecisionPayloadInterface): Promise<DecisionInterface> => {
            const res = await decisionsService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: decisionsConstants.messages.updateSuccess,
            errorFallback: decisionsConstants.errors.updateFailed,
            onFieldErrors,
            context: "decisions.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
