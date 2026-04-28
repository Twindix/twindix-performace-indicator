import { useCallback } from "react";

import { authConstants } from "@/constants";
import { commonData } from "@/data";
import type { UseLoginOptionsInterface } from "@/interfaces";
import { resetAuthState } from "@/lib/axios";
import { setCookieHandler } from "@/lib/cookies";
import { runAction } from "@/lib/handle-action";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth";

export const useLogin = ({ onFieldErrors }: UseLoginOptionsInterface = {}) => {
    const onLogin = useCallback(
        async (email: string, password: string): Promise<void> => {
            await runAction(
                async () => {
                    const response = await authService.loginHandler(email, password);
                    setCookieHandler(commonData.token.tokenKey, response.token);
                    resetAuthState();
                    useAuthStore.getState().setUser(response.user);
                },
                {
                    errorFallback: authConstants.errors.loginFailed,
                    onFieldErrors,
                    rethrow: true,
                    context: "auth.login",
                    silent: true,
                },
            );
        },
        [onFieldErrors],
    );

    return { onLogin };
};
