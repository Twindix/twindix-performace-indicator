import { useEffect, useState } from "react";

import type { UserInterface } from "@/interfaces/common";
import { usersService } from "@/services/users";

interface UsersDetailState {
    user: UserInterface | null;
    isLoading: boolean;
    error: string | null;
}

export const useUsersDetail = (id: string | undefined) => {
    const [state, setState] = useState<UsersDetailState>({
        user: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        if (!id) {
            setState({ user: null, isLoading: false, error: null });
            return;
        }
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        usersService
            .detailHandler(id)
            .then((user) => setState({ user, isLoading: false, error: null }))
            .catch(() => setState({ user: null, isLoading: false, error: "User not found" }));
    }, [id]);

    return state;
};
