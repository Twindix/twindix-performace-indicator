import { requirementsConstants } from "@/constants/requirements";
import type { UpdateRequirementPayloadInterface, RequirementInterface } from "@/interfaces";
import { requirementsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateRequirementOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateRequirement = ({ onFieldErrors }: UseUpdateRequirementOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateRequirementPayloadInterface): Promise<RequirementInterface> => {
            const res = await requirementsService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: requirementsConstants.messages.updateSuccess,
            errorFallback: requirementsConstants.errors.updateFailed,
            onFieldErrors,
            context: "requirements.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
