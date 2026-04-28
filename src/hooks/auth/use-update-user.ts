import { useCallback } from "react";

import type { UserInterface } from "@/interfaces";
import { useAuthStore } from "@/store/auth";

export const useUpdateUser = () => {
    const onUpdateUser = useCallback((updates: Partial<UserInterface>): void => {
        const current = useAuthStore.getState().user;
        if (current) useAuthStore.getState().setUser({ ...current, ...updates });
    }, []);

    return { onUpdateUser };
};
