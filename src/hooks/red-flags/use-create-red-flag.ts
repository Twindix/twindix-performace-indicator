import { redFlagsConstants } from "@/constants";
import type { CreateRedFlagPayloadInterface, RedFlagInterface } from "@/interfaces";
import { redFlagsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateRedFlagOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateRedFlag = ({ onFieldErrors }: UseCreateRedFlagOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (sprintId: string, payload: CreateRedFlagPayloadInterface): Promise<RedFlagInterface> => {
            const res = await redFlagsService.createHandler(sprintId, payload);
            return (res as unknown as { data?: RedFlagInterface }).data ?? (res as unknown as RedFlagInterface);
        },
        {
            successMessage: redFlagsConstants.messages.createSuccess,
            errorFallback: redFlagsConstants.errors.createFailed,
            onFieldErrors,
            context: "red-flags.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
