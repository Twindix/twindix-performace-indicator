import { useCallback } from "react";

import { commonData } from "@/data";
import { deleteCookieHandler } from "@/lib/cookies";
import { runAction } from "@/lib/handle-action";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth";

export const useLogout = () => {
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

    return { onLogout };
};
