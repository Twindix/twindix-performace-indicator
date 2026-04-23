import { sprintsConstants } from "@/constants";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateSprintOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateSprint = ({ onFieldErrors }: UseCreateSprintOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (payload: CreateSprintPayloadInterface): Promise<SprintInterface> => {
            const res = await sprintsService.createHandler(payload);
            return res.data;
        },
        {
            successMessage: sprintsConstants.messages.createSuccess,
            errorFallback: sprintsConstants.errors.createFailed,
            onFieldErrors,
            context: "sprint.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
