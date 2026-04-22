import { authConstants } from "@/constants";
import type { UserInterface } from "@/interfaces";
import { authService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateMeOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateMe = ({ onFieldErrors }: UseUpdateMeOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        (updates: Partial<Pick<UserInterface, "full_name" | "presence_status" | "settings">>): Promise<UserInterface> =>
            authService.updateMeHandler(updates),
        {
            errorFallback: authConstants.errors.updateMeFailed,
            onFieldErrors,
            context: "auth.update-me",
        },
    );

    return { updateHandler: mutate, isLoading };
};
