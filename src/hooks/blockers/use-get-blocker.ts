import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, BlockersListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useGetBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<BlockerInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (sprintId: string, filters?: BlockersListFiltersInterface): Promise<BlockerInterface[] | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.listHandler(sprintId, filters);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, isLoading };
};
