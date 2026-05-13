import { sprintsConstants } from "@/constants";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateSprintOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

interface CreateSprintArgs {
    projectId: string;
    payload: CreateSprintPayloadInterface;
}

export const useCreateSprint = ({ onFieldErrors }: UseCreateSprintOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async ({ projectId, payload }: CreateSprintArgs): Promise<SprintInterface> => {
            const res = await sprintsService.createHandler(projectId, payload);
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
