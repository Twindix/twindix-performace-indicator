import { usersConstants } from "@/constants";
import type { UserInterface } from "@/interfaces/common";
import { usersService } from "@/services/users";

import { useQueryAction } from "../shared";

export const useUsersDetail = (id: string | undefined) => {
    const { data, isLoading, refetch } = useQueryAction<UserInterface | null>(
        async () => (id ? await usersService.detailHandler(id) : null),
        [id],
        {
            enabled: !!id,
            errorFallback: usersConstants.errors.detailFetchFailed,
            initialData: null,
            context: "users.detail",
        },
    );

    return { user: data ?? null, isLoading, refetch };
};
