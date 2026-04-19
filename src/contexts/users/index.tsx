import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants/users";
import type { UserInterface, UserSettingsInterface, UsersContextInterface, UsersListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

const UsersContext = createContext<UsersContextInterface | null>(null);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<UserInterface[]>([]);
    const [settings, setSettingsState] = useState<UserSettingsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (filters?: UsersListFiltersInterface): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await usersService.listHandler(filters);
            setUsers(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refetchSettings = useCallback(async (): Promise<void> => {
        try {
            const res = await usersService.getMeSettingsHandler();
            setSettingsState(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.settingsFetchFailed));
        }
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const patchUserLocal = useCallback((user: UserInterface) => {
        setUsers((prev) => {
            const exists = prev.some((u) => u.id === user.id);
            return exists ? prev.map((u) => u.id === user.id ? user : u) : [...prev, user];
        });
    }, []);

    const removeUserLocal = useCallback((id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    }, []);

    const setSettings = useCallback((next: UserSettingsInterface) => {
        setSettingsState(next);
    }, []);

    const value = useMemo<UsersContextInterface>(() => ({
        users,
        settings,
        isLoading,
        refetch,
        refetchSettings,
        patchUserLocal,
        removeUserLocal,
        setSettings,
    }), [users, settings, isLoading, refetch, refetchSettings, patchUserLocal, removeUserLocal, setSettings]);

    return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = (): UsersContextInterface => {
    const ctx = useContext(UsersContext);
    if (!ctx) throw new Error("useUsers must be used within UsersProvider");
    return ctx;
};
