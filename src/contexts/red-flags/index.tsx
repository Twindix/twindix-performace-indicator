import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants/red-flags";
import type { RedFlagInterface, RedFlagsContextInterface, RedFlagsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

const RedFlagsContext = createContext<RedFlagsContextInterface | null>(null);

export const RedFlagsProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [redFlags, setRedFlags] = useState<RedFlagInterface[]>([]);
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (filters?: RedFlagsListFiltersInterface): Promise<void> => {
        if (!sprintId) { setRedFlags([]); return; }
        setIsLoading(true);
        try {
            const res = await redFlagsService.listHandler(sprintId, filters);
            setRedFlags(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchCount = useCallback(async (): Promise<void> => {
        if (!sprintId) { setCount(0); return; }
        try {
            const res = await redFlagsService.countHandler(sprintId);
            setCount(res.count);
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.countFailed));
        }
    }, [sprintId]);

    useEffect(() => {
        refetch();
        refetchCount();
    }, [refetch, refetchCount]);

    const patchRedFlagLocal = useCallback((flag: RedFlagInterface) => {
        setRedFlags((prev) => {
            const exists = prev.some((f) => f.id === flag.id);
            return exists ? prev.map((f) => f.id === flag.id ? flag : f) : [...prev, flag];
        });
    }, []);

    const removeRedFlagLocal = useCallback((id: string) => {
        setRedFlags((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const value = useMemo<RedFlagsContextInterface>(() => ({
        redFlags,
        count,
        isLoading,
        refetch,
        refetchCount,
        patchRedFlagLocal,
        removeRedFlagLocal,
    }), [redFlags, count, isLoading, refetch, refetchCount, patchRedFlagLocal, removeRedFlagLocal]);

    return <RedFlagsContext.Provider value={value}>{children}</RedFlagsContext.Provider>;
};

export const useRedFlags = (): RedFlagsContextInterface => {
    const ctx = useContext(RedFlagsContext);
    if (!ctx) throw new Error("useRedFlags must be used within RedFlagsProvider");
    return ctx;
};
