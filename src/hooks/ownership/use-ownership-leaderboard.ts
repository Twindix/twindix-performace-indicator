import { ownershipConstants } from "@/constants";
import type { FeatureInterface } from "@/interfaces";
import { ownershipService } from "@/services";

import { useQueryAction } from "../shared";

export const useOwnershipBySprint = (sprintId: string) => {
    const { data, isLoading, refetch } = useQueryAction<FeatureInterface[] | null>(
        () => ownershipService.bySprintHandler(sprintId),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: ownershipConstants.errors.leaderboardFailed,
            context: "ownership.bySprint",
            initialData: null,
        },
    );
    return { items: data ?? [], isLoading, refetch };
};
