import { useCallback, useState } from "react";

import type { UserInterface } from "@/interfaces/common";
import type { CreateUserPayloadInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

export const useUsersCreate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (payload: CreateUserPayloadInterface): Promise<UserInterface | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await usersService.createHandler(payload);
            return user;
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Failed to create user";
            setError(msg);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { create, isLoading, error };
};
