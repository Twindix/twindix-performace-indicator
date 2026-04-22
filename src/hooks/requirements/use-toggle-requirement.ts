import { requirementsConstants } from "@/constants/requirements";
import type { RequirementInterface } from "@/interfaces";
import { requirementsService } from "@/services";

import { useMutationAction } from "../shared";

export const useToggleRequirement = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<RequirementInterface> => {
            const res = await requirementsService.toggleHandler(id);
            return res.data;
        },
        {
            successMessage: requirementsConstants.messages.toggleSuccess,
            errorFallback: requirementsConstants.errors.toggleFailed,
            context: "requirements.toggle",
        },
    );

    return { toggleHandler: mutate, isLoading };
};
