import { blockersConstants } from "@/constants";
import type { BlockerInterface, CreateBlockerPayloadInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateBlockerOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateBlocker = ({ onFieldErrors }: UseCreateBlockerOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (sprintId: string, payload: CreateBlockerPayloadInterface): Promise<BlockerInterface> => {
            const res = await blockersService.createHandler(sprintId, payload);
            return res.data;
        },
        {
            successMessage: blockersConstants.messages.createSuccess,
            errorFallback: blockersConstants.errors.createFailed,
            onFieldErrors,
            context: "blockers.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
