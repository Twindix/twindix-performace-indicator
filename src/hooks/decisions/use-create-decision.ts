import { decisionsConstants } from "@/constants";
import type { CreateDecisionPayloadInterface, DecisionInterface } from "@/interfaces";
import { decisionsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateDecisionOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateDecision = ({ onFieldErrors }: UseCreateDecisionOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (sprintId: string, payload: CreateDecisionPayloadInterface): Promise<DecisionInterface> => {
            const res = await decisionsService.createHandler(sprintId, payload);
            return (res as unknown as { data?: DecisionInterface }).data ?? (res as unknown as DecisionInterface);
        },
        {
            successMessage: decisionsConstants.messages.createSuccess,
            errorFallback: decisionsConstants.errors.createFailed,
            onFieldErrors,
            context: "decisions.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
