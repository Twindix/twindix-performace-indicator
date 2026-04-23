import { usersConstants } from "@/constants";
import type { UserInterface } from "@/interfaces/common";
import type { UpdateUserPayloadInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUsersUpdateOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUsersUpdate = ({ onFieldErrors }: UseUsersUpdateOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        (id: string, payload: UpdateUserPayloadInterface): Promise<UserInterface> =>
            usersService.updateHandler(id, payload),
        {
            errorFallback: usersConstants.errors.updateFailed,
            onFieldErrors,
            context: "users.update",
        },
    );

    return { update: mutate, isLoading };
};
