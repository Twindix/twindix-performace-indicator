import { usersConstants } from "@/constants";
import type { UserInterface } from "@/interfaces";
import { usersService } from "@/services/users";

import { useQueryAction } from "../shared";

export const useUsersList = () => {
    const { data, isLoading, refetch } = useQueryAction<UserInterface[]>(
        () => usersService.listHandler(),
        [],
        {
            errorFallback: usersConstants.errors.fetchFailed,
            initialData: [],
            context: "users.list",
        },
    );

    return { users: data ?? [], isLoading, refetch };
};
