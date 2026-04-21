import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import type { DecisionsAnalyticsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

export const useDecisionsAnalytics = (sprintId: string) => {
    const [analytics, setAnalytics] = useState<DecisionsAnalyticsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!sprintId) { setAnalytics(null); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await decisionsService.analyticsHandler(sprintId);
            setAnalytics(res);
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.fetchAnalyticsFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    useEffect(() => { fetch(); }, [fetch]);

    return { analytics, isLoading, refetch: fetch };
};
