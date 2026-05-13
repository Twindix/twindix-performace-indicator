import { usersConstants } from "@/constants";
import type { UserLiteInterface } from "@/interfaces";
import { usersService } from "@/services/users";

import { useSessionCachedList } from "../shared";

export const useUsersListLite = () => {
    const { data, isLoading, refetch } = useSessionCachedList<UserLiteInterface>(
        "users.lite",
        () => usersService.listLiteHandler(),
        { errorFallback: usersConstants.errors.fetchFailed, context: "users.listLite" },
    );
    return { users: data, isLoading, refetch };
};
