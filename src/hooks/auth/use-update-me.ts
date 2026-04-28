import { authConstants } from "@/constants";
import type { UserInterface, UseUpdateMeOptionsInterface } from "@/interfaces";
import { authService } from "@/services";

import { useMutationAction } from "../shared";

export const useUpdateMe = ({ onFieldErrors }: UseUpdateMeOptionsInterface = {}) => {
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
