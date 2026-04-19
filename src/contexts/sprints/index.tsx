import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants/sprints";
import type { SprintInterface, SprintSummaryInterface, SprintsContextInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

const SprintsContext = createContext<SprintsContextInterface | null>(null);

export const SprintsProvider = ({ children }: { children: ReactNode }) => {
    const [sprints, setSprints] = useState<SprintInterface[]>([]);
    const [summaries, setSummaries] = useState<Record<string, SprintSummaryInterface | undefined>>({});
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await sprintsService.listHandler();
            setSprints(res.data);
            res.data.forEach((s) => {
                sprintsService.summaryHandler(s.id)
                    .then((r) => setSummaries((prev) => ({ ...prev, [s.id]: r })))
                    .catch(() => null);
            });
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const setSummary = useCallback((id: string, summary: SprintSummaryInterface) => {
        setSummaries((prev) => ({ ...prev, [id]: summary }));
    }, []);

    const patchSprintLocal = useCallback((sprint: SprintInterface) => {
        setSprints((prev) => {
            const exists = prev.some((s) => s.id === sprint.id);
            return exists ? prev.map((s) => s.id === sprint.id ? sprint : s) : [...prev, sprint];
        });
    }, []);

    const removeSprintLocal = useCallback((id: string) => {
        setSprints((prev) => prev.filter((s) => s.id !== id));
        setSummaries((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    const value = useMemo<SprintsContextInterface>(() => ({
        sprints,
        summaries,
        isLoading,
        refetch,
        setSummary,
        patchSprintLocal,
        removeSprintLocal,
    }), [sprints, summaries, isLoading, refetch, setSummary, patchSprintLocal, removeSprintLocal]);

    return <SprintsContext.Provider value={value}>{children}</SprintsContext.Provider>;
};

export const useSprints = (): SprintsContextInterface => {
    const ctx = useContext(SprintsContext);
    if (!ctx) throw new Error("useSprints must be used within SprintsProvider");
    return ctx;
};
