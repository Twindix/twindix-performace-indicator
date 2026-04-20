import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/contexts";
import { commonData } from "@/data";
import type { UserInterface } from "@/interfaces";
import { AUTH_UNAUTHORIZED_EVENT, resetAuthState } from "@/lib/axios";
import { deleteCookieHandler, getCookieHandler, setCookieHandler } from "@/lib/cookies";
import { authService } from "@/services";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount if token exists
    useEffect(() => {
        const token = getCookieHandler(commonData.token.tokenKey);
        if (!token) {
            setIsLoading(false);
            return;
        }
        authService.meHandler()
            .then(setUser)
            .catch(() => deleteCookieHandler(commonData.token.tokenKey))
            .finally(() => setIsLoading(false));
    }, []);

    // React to "unauthorized" events raised by the axios interceptor.
    useEffect(() => {
        const handleUnauthorized = () => setUser(null);
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    }, []);

    const onLogin = useCallback(async (email: string, password: string): Promise<void> => {
        const response = await authService.loginHandler(email, password);
        setCookieHandler(commonData.token.tokenKey, response.token);
        resetAuthState();
        setUser(response.user);
    }, []);

    const onLogout = useCallback(async (): Promise<void> => {
        try {
            await authService.logoutHandler();
        } finally {
            deleteCookieHandler(commonData.token.tokenKey);
            setUser(null);
        }
    }, []);

    const onUpdateUser = useCallback((updates: Partial<UserInterface>) => {
        setUser((prev) => prev ? { ...prev, ...updates } : prev);
    }, []);

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        isLoading,
        user,
        onLogin,
        onLogout,
        onUpdateUser,
    }), [user, isLoading, onLogin, onLogout, onUpdateUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
