import { useCallback } from "react";

import { commonData } from "@/data";
import type { UserInterface } from "@/interfaces";
import { resetAuthState } from "@/lib/axios";
import { deleteCookieHandler, setCookieHandler } from "@/lib/cookies";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth";

export const useAuth = () => {
    const { user, isLoading } = useAuthStore();

    const onLogin = useCallback(async (email: string, password: string): Promise<void> => {
        const response = await authService.loginHandler(email, password);
        setCookieHandler(commonData.token.tokenKey, response.token);
        resetAuthState();
        useAuthStore.getState().setUser(response.user);
    }, []);

    const onLogout = useCallback(async (): Promise<void> => {
        try {
            await authService.logoutHandler();
        } finally {
            deleteCookieHandler(commonData.token.tokenKey);
            useAuthStore.getState().setUser(null);
        }
    }, []);

    const onUpdateUser = useCallback((updates: Partial<UserInterface>): void => {
        const current = useAuthStore.getState().user;
        if (current) useAuthStore.getState().setUser({ ...current, ...updates });
    }, []);

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        onLogin,
        onLogout,
        onUpdateUser,
    };
};
