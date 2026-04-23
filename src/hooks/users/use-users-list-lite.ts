import { usersConstants } from "@/constants";
import type { UserLiteInterface } from "@/interfaces";
import { usersService } from "@/services/users";

import { useQueryAction } from "../shared";

export const useUsersListLite = () => {
    const { data, isLoading, refetch } = useQueryAction<UserLiteInterface[]>(
        () => usersService.listLiteHandler(),
        [],
        {
            errorFallback: usersConstants.errors.fetchFailed,
            initialData: [],
            context: "users.listLite",
        },
    );

    return { users: data ?? [], isLoading, refetch };
};
