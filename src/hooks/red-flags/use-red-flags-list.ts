import { useCallback } from "react";

import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface } from "@/interfaces";
import { redFlagsService } from "@/services";

import { usePaginatedQuery } from "../shared";

export interface UseRedFlagsListOptions {
    initialPerPage?: number;
}

export const useRedFlagsList = (sprintId: string, { initialPerPage }: UseRedFlagsListOptions = {}) => {
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<RedFlagInterface>(
        ({ page, per_page }) => redFlagsService.listHandler(sprintId, { page, per_page }),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: redFlagsConstants.errors.fetchFailed,
            context: "red-flags.list",
            initialPerPage,
        },
    );

    const patchRedFlagLocal = useCallback((flag: RedFlagInterface) => {
        setItems((prev) => {
            const exists = prev.some((f) => f.id === flag.id);
            return exists
                ? prev.map((f) => (f.id === flag.id ? { ...f, ...flag } : f))
                : [flag, ...prev];
        });
    }, [setItems]);

    const removeRedFlagLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((f) => f.id !== id));
    }, [setItems]);

    return { redFlags: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchRedFlagLocal, removeRedFlagLocal };
};
