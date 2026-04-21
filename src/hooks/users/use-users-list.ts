import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { UserInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useUsersList = () => {
    const [users, setUsers] = useState<UserInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await usersService.listHandler();
            setUsers(res);
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to fetch users"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    return { users, isLoading, refetch };
};
