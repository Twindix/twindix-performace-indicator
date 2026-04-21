import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useRedFlagsList = (sprintId: string) => {
    const [redFlags, setRedFlags] = useState<RedFlagInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!sprintId) return;
        setIsLoading(true);
        try {
            const res = await redFlagsService.listHandler(sprintId);
            setRedFlags(res.data);
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, redFlagsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    useEffect(() => { fetch(); }, [fetch]);

    const patchRedFlagLocal = useCallback((flag: RedFlagInterface) => {
        setRedFlags((prev) => {
            const exists = prev.some((f) => f.id === flag.id);
            return exists ? prev.map((f) => f.id === flag.id ? flag : f) : [...prev, flag];
        });
    }, []);

    const removeRedFlagLocal = useCallback((id: string) => {
        setRedFlags((prev) => prev.filter((f) => f.id !== id));
    }, []);

    return { redFlags, isLoading, refetch: fetch, patchRedFlagLocal, removeRedFlagLocal };
};
