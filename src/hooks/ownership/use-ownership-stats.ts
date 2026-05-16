import { ownershipConstants } from "@/constants";
import type { OwnershipStatsInterface } from "@/interfaces";
import { ownershipService } from "@/services";

import { useQueryAction } from "../shared";

export const useOwnershipStats = () => {
    const { data, isLoading, refetch } = useQueryAction<OwnershipStatsInterface | null>(
        () => ownershipService.statsHandler(),
        [],
        {
            errorFallback: ownershipConstants.errors.statsFailed,
            context: "ownership.stats",
            initialData: null,
        },
    );
    return { stats: data ?? null, isLoading, refetch };
};
