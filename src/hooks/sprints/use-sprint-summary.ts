import { sprintsConstants } from "@/constants";
import type { SprintSummaryInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useQueryAction } from "../shared";

export const useSprintSummary = (id: string | undefined) => {
    const { data, isLoading, refetch } = useQueryAction<SprintSummaryInterface | null>(
        async () => (id ? await sprintsService.summaryHandler(id) : null),
        [id],
        {
            enabled: !!id,
            errorFallback: sprintsConstants.errors.summaryFailed,
            initialData: null,
            context: "sprints.summary",
        },
    );

    return { summary: data ?? null, isLoading, refetch };
};
