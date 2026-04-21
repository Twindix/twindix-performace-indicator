import { useCallback, useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import type { DecisionInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

export const useGetDecision = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = useCallback(async (id: string): Promise<DecisionInterface | null> => {
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
    }, []);

    return { getHandler, isLoading };
};
