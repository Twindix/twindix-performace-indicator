import { useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import type { DecisionInterface, DecisionsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

export const useGetDecision = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<DecisionInterface | null> => {
        if (!navigator.onLine) throw new Error(decisionsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await decisionsService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (sprintId: string, filters?: DecisionsListFiltersInterface): Promise<DecisionInterface[] | null> => {
        if (!navigator.onLine) throw new Error(decisionsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await decisionsService.listHandler(sprintId, filters);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, isLoading };
};
