import { useCallback, useState } from "react";

import type { UserInterface } from "@/interfaces/common";
import type { UpdateUserPayloadInterface } from "@/interfaces/users";
import { usersService } from "@/services/users";

export const useUsersUpdate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (id: string, payload: UpdateUserPayloadInterface): Promise<UserInterface | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await usersService.updateHandler(id, payload);
            return user;
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Failed to update user";
            setError(msg);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { update, isLoading, error };
};
