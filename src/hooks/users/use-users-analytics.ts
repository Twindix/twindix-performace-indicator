import { useEffect, useState } from "react";

import type { UserAnalyticsInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

interface UsersAnalyticsState {
    analytics: UserAnalyticsInterface | null;
    isLoading: boolean;
    error: string | null;
}

export const useUsersAnalytics = (id: string | undefined, sprintId?: string) => {
    const [state, setState] = useState<UsersAnalyticsState>({
        analytics: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        if (!id) {
            setState({ analytics: null, isLoading: false, error: null });
            return;
        }
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        usersService
            .analyticsHandler(id)
            .then((analytics) => setState({ analytics, isLoading: false, error: null }))
            .catch(() => setState({ analytics: null, isLoading: false, error: "Analytics unavailable" }));
    }, [id, sprintId]);

    return state;
};
