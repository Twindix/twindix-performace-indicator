import { ownershipConstants } from "@/constants";
import type { OwnershipFeedFiltersInterface, OwnershipFeedItemInterface } from "@/interfaces";
import { ownershipService } from "@/services";

import { usePaginatedQuery } from "../shared";

export const useOwnershipFeed = (filters?: OwnershipFeedFiltersInterface) => {
    const { type, creator, search } = filters ?? {};
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch } = usePaginatedQuery<OwnershipFeedItemInterface>(
        ({ page, per_page }) => ownershipService.feedHandler({ type, creator, search, page, per_page }),
        [type, creator, search],
        {
            errorFallback: ownershipConstants.errors.fetchFailed,
            context: "ownership.feed",
        },
    );
    return { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch };
};
