import { ownershipConstants } from "@/constants";
import type { FeatureInterface } from "@/interfaces";
import { ownershipService } from "@/services";

import { useQueryAction } from "../shared";

export const useOwnershipByUser = (userId: string) => {
    const { data, isLoading, refetch } = useQueryAction<FeatureInterface[] | null>(
        () => ownershipService.byUserHandler(userId),
        [userId],
        {
            enabled: !!userId,
            errorFallback: ownershipConstants.errors.statsFailed,
            context: "ownership.byUser",
            initialData: null,
        },
    );
    return { items: data ?? [], isLoading, refetch };
};
