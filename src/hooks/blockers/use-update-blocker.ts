import { blockersConstants } from "@/constants";
import type { BlockerInterface, UpdateBlockerPayloadInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateBlockerOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateBlocker = ({ onFieldErrors }: UseUpdateBlockerOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateBlockerPayloadInterface): Promise<BlockerInterface> => {
            const res = await blockersService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: blockersConstants.messages.updateSuccess,
            errorFallback: blockersConstants.errors.updateFailed,
            onFieldErrors,
            context: "blockers.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
