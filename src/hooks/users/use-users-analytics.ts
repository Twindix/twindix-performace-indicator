import type { UserAnalyticsInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

import { useQueryAction } from "../shared";

export const useUsersAnalytics = (id: string | undefined, sprintId?: string) => {
    const { data, isLoading, refetch } = useQueryAction<UserAnalyticsInterface | null>(
        async () => (id ? await usersService.analyticsHandler(id) : null),
        [id, sprintId],
        {
            enabled: !!id,
            silent: true,
            initialData: null,
            context: "users.analytics",
        },
    );

    return { analytics: data ?? null, isLoading, refetch };
};
