import { usersConstants } from "@/constants";
import type { UserInterface } from "@/interfaces/common";
import type { CreateUserPayloadInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUsersCreateOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUsersCreate = ({ onFieldErrors }: UseUsersCreateOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        (payload: CreateUserPayloadInterface): Promise<UserInterface> => usersService.createHandler(payload),
        {
            successMessage: usersConstants.messages.createSuccess,
            errorFallback: usersConstants.errors.createFailed,
            onFieldErrors,
            context: "users.create",
        },
    );

    return { create: mutate, isLoading };
};
