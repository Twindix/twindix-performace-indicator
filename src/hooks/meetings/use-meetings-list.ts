import { meetingsConstants } from "@/constants";
import type { MeetingListItemInterface, MeetingsListFiltersInterface } from "@/interfaces";
import { meetingsService } from "@/services";

import { usePaginatedQuery } from "../shared";

export const useMeetingsList = (projectId: string, filters?: MeetingsListFiltersInterface) => {
    const { status, from, to, search } = filters ?? {};
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<MeetingListItemInterface>(
        ({ page, per_page }) => meetingsService.listHandler(projectId, { status, from, to, search, page, per_page }),
        [projectId, status, from, to, search],
        {
            enabled: !!projectId,
            errorFallback: meetingsConstants.errors.fetchFailed,
            context: "meetings.list",
        },
    );
    return { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems };
};
