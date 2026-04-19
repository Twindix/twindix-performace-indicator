import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/contexts";
import { commonData } from "@/data";
import { UserRole } from "@/enums";
import type { UserInterface } from "@/interfaces";
import { deleteCookieHandler, getCookieHandler, setCookieHandler } from "@/lib/cookies";
import { authService } from "@/services";

const DEV_FAKE_USER: UserInterface = {
    id: "dev-admin",
    name: "Dev Admin",
    email: "dev@twindix.com",
    role: UserRole.CEO,
    avatar: "DA",
    team: "Leadership",
    status: "active",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserInterface | null>(
        () => (import.meta.env.DEV ? DEV_FAKE_USER : null),
    );
    const [isLoading, setIsLoading] = useState(!import.meta.env.DEV);

    // Restore session on mount if token exists (skipped in DEV — fake user already set)
    useEffect(() => {
        if (import.meta.env.DEV) return;
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

    const onLogin = useCallback(async (email: string, password: string): Promise<void> => {
        const response = await authService.loginHandler(email, password);
        setCookieHandler(commonData.token.tokenKey, response.data.token);
        setUser(response.data.user);
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
