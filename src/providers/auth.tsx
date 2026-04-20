import { type ReactNode, useCallback, useMemo, useState } from "react";

import { AuthContext } from "@/contexts";
import { DEMO_PASSWORD } from "@/data";
import { seedTeamMembers } from "@/data/seed";
import type { UserInterface } from "@/interfaces";
import { getStorageItem, removeStorageItem, setStorageItem, storageKeys } from "@/utils";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserInterface | null>(() => getStorageItem<UserInterface>(storageKeys.authUser));

    const onLogin = useCallback((email: string, password: string): boolean => {
        if (password !== DEMO_PASSWORD) return false;
        const found = seedTeamMembers.find((m) => m.email === email);
        if (!found) return false;
        setStorageItem(storageKeys.authUser, found);
        setUser(found);
        return true;
    }, []);

    const onLogout = useCallback(() => {
        removeStorageItem(storageKeys.authUser);
        setUser(null);
    }, []);

    const onUpdateUser = useCallback((updates: Partial<UserInterface>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            setStorageItem(storageKeys.authUser, updated);
            return updated;
        });
    }, []);

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        onLogin,
        onLogout,
        onUpdateUser,
    }), [user, onLogin, onLogout, onUpdateUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
