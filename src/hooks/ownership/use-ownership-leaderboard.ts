import { ownershipConstants } from "@/constants";
import type { OwnershipLeaderboardEntryInterface } from "@/interfaces";
import { ownershipService } from "@/services";

import { useQueryAction } from "../shared";

export const useOwnershipLeaderboard = () => {
    const { data, isLoading, refetch } = useQueryAction<OwnershipLeaderboardEntryInterface[] | null>(
        () => ownershipService.leaderboardHandler(),
        [],
        {
            errorFallback: ownershipConstants.errors.leaderboardFailed,
            context: "ownership.leaderboard",
            initialData: null,
        },
    );
    return { leaderboard: data ?? [], isLoading, refetch };
};
