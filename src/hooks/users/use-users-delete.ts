import { usersConstants } from "@/constants";
import { usersService } from "@/services/users";

import { useMutationAction } from "../shared";

export const useUsersDelete = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await usersService.deleteHandler(id);
            return true;
        },
        {
            successMessage: usersConstants.messages.deleteSuccess,
            errorFallback: usersConstants.errors.deleteFailed,
            context: "users.delete",
        },
    );

    return { remove: mutate, isLoading };
};
