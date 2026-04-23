import { usersConstants } from "@/constants";
import type { UserInterface } from "@/interfaces";
import { usersService } from "@/services/users";

import { useQueryAction } from "../shared";

export const useUsersList = () => {
    const { data, isLoading, refetch, setData } = useQueryAction<UserInterface[]>(
        () => usersService.listHandler(),
        [],
        {
            errorFallback: usersConstants.errors.fetchFailed,
            initialData: [],
            context: "users.list",
        },
    );

    const patchUserLocal = (updated: UserInterface) =>
        setData((prev) => (prev ?? []).map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));

    return { users: data ?? [], isLoading, refetch, patchUserLocal };
};
