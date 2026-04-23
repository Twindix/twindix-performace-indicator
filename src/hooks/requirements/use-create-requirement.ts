import { requirementsConstants } from "@/constants/requirements";
import type { CreateRequirementPayloadInterface, RequirementInterface } from "@/interfaces";
import { requirementsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateRequirementOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateRequirement = ({ onFieldErrors }: UseCreateRequirementOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (taskId: string, payload: CreateRequirementPayloadInterface): Promise<RequirementInterface> => {
            const res = await requirementsService.createHandler(taskId, payload);
            return res.data;
        },
        {
            successMessage: requirementsConstants.messages.createSuccess,
            errorFallback: requirementsConstants.errors.createFailed,
            onFieldErrors,
            context: "requirements.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
