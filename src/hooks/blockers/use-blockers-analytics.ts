import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockersAnalyticsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useBlockersAnalytics = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (sprintId: string): Promise<BlockersAnalyticsInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.analyticsHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.analyticsFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, isLoading };
};
