import { sprintsConstants } from "@/constants";
import type { SprintInterface, UpdateSprintPayloadInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateSprintOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateSprint = ({ onFieldErrors }: UseUpdateSprintOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateSprintPayloadInterface): Promise<SprintInterface> => {
            const res = await sprintsService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: sprintsConstants.messages.updateSuccess,
            errorFallback: sprintsConstants.errors.updateFailed,
            onFieldErrors,
            context: "sprint.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
