import { useCallback, useState } from "react";

import { usersService } from "@/services/users";

export const useUsersDelete = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remove = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await usersService.deleteHandler(id);
            return true;
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Failed to delete user";
            setError(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { remove, isLoading, error };
};
