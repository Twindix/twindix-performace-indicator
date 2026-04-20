import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { SprintSummaryInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useSprintSummary = (id: string | undefined) => {
    const [summary, setSummary] = useState<SprintSummaryInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetch = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const res = await sprintsService.summaryHandler(id);
            setSummary(res);
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.summaryFailed));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetch(); }, [fetch]);

    return { summary, isLoading, refetch: fetch };
};
