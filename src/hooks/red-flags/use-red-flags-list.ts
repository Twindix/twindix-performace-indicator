import { useCallback } from "react";

import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface } from "@/interfaces";
import { redFlagsService } from "@/services";

import { useQueryAction } from "../shared";

export const useRedFlagsList = (sprintId: string) => {
    const { data, isLoading, refetch, setData } = useQueryAction<RedFlagInterface[]>(
        async () => (sprintId ? (await redFlagsService.listHandler(sprintId)).data : []),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: redFlagsConstants.errors.fetchFailed,
            initialData: [],
            context: "red-flags.list",
        },
    );

    const patchRedFlagLocal = useCallback((flag: RedFlagInterface) => {
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((f) => f.id === flag.id);
            return exists
                ? arr.map((f) => (f.id === flag.id ? { ...f, ...flag } : f))
                : [flag, ...arr];
        });
    }, [setData]);

    const removeRedFlagLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((f) => f.id !== id));
    }, [setData]);

    return { redFlags: data ?? [], isLoading, refetch, patchRedFlagLocal, removeRedFlagLocal };
};
