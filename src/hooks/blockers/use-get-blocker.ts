import { useCallback, useState } from "react";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, BlockersListFiltersInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { blockersService } from "@/services";

export const useGetBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = useCallback(async (id: string): Promise<BlockerInterface | null> => {
        setIsLoading(true);
        try {
            const res = await runAction(() => blockersService.detailHandler(id), {
                errorFallback: blockersConstants.errors.fetchDetailFailed,
                context: "blockers.detail",
            });
            return res?.data ?? null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllHandler = useCallback(async (sprintId: string, filters?: BlockersListFiltersInterface): Promise<BlockerInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await runAction(() => blockersService.listHandler(sprintId, filters), {
                errorFallback: blockersConstants.errors.fetchFailed,
                context: "blockers.list",
            });
            return res?.data ?? null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getHandler, getAllHandler, isLoading };
};
