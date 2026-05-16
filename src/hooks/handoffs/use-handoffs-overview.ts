import { handoffsConstants } from "@/constants";
import type { HandoffsFiltersInterface, HandoffsResponseInterface } from "@/interfaces";
import { handoffsService } from "@/services";

import { useQueryAction } from "../shared";

export const useHandoffsOverview = (filters?: HandoffsFiltersInterface) => {
    const { scope, sprint_id, project_id } = filters ?? {};
    const { data, isLoading, refetch, setData } = useQueryAction<HandoffsResponseInterface | null>(
        () => handoffsService.overviewHandler({ scope, sprint_id, project_id }),
        [scope, sprint_id, project_id],
        {
            errorFallback: handoffsConstants.errors.fetchFailed,
            context: "handoffs.overview",
            initialData: null,
        },
    );
    return { data: data ?? null, isLoading, refetch, setData };
};
