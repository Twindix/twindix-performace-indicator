import { useCallback, useState } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import type { UserInterface, UsersListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useGetUser = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = useCallback(async (id: string): Promise<UserInterface | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllHandler = useCallback(async (filters?: UsersListFiltersInterface): Promise<UserInterface[] | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.listHandler(filters);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getHandler, getAllHandler, isLoading };
};
