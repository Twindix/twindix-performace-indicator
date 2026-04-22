import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface, UpdateRedFlagPayloadInterface } from "@/interfaces";
import { redFlagsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateRedFlagOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateRedFlag = ({ onFieldErrors }: UseUpdateRedFlagOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateRedFlagPayloadInterface): Promise<RedFlagInterface> => {
            const res = await redFlagsService.updateHandler(id, payload);
            return (res as unknown as { data?: RedFlagInterface }).data ?? (res as unknown as RedFlagInterface);
        },
        {
            successMessage: redFlagsConstants.messages.updateSuccess,
            errorFallback: redFlagsConstants.errors.updateFailed,
            onFieldErrors,
            context: "red-flags.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
