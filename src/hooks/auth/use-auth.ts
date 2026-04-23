import { useCallback } from "react";

import { authConstants } from "@/constants";
import { commonData } from "@/data";
import type { UserInterface } from "@/interfaces";
import { resetAuthState } from "@/lib/axios";
import { deleteCookieHandler, setCookieHandler } from "@/lib/cookies";
import { runAction } from "@/lib/handle-action";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth";

import { type FieldErrors } from "../shared";

export interface LoginOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useAuth = () => {
    const { user, isLoading } = useAuthStore();

    const onLogin = useCallback(
        async (email: string, password: string, options: LoginOptions = {}): Promise<void> => {
            await runAction(
                async () => {
                    const response = await authService.loginHandler(email, password);
                    setCookieHandler(commonData.token.tokenKey, response.token);
                    resetAuthState();
                    useAuthStore.getState().setUser(response.user);
                },
                {
                    errorFallback: authConstants.errors.loginFailed,
                    onFieldErrors: options.onFieldErrors,
                    rethrow: true,
                    context: "auth.login",
                    silent: true,
                },
            );
        },
        [],
    );

    const onLogout = useCallback(async (): Promise<void> => {
        try {
            await runAction(() => authService.logoutHandler(), {
                silent: true,
                context: "auth.logout",
            });
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
