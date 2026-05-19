import { handoffsConstants } from "@/constants";
import type { HandoffStatusResponseInterface } from "@/interfaces";
import { handoffsService } from "@/services";

import { useQueryAction } from "../shared";

export const useHandoffsOverview = (projectId: string, sprintId: string) => {
    const { data, isLoading, refetch, setData } = useQueryAction<HandoffStatusResponseInterface | null>(
        async () => {
            console.log('[Handoffs] Fetching data for:', { projectId, sprintId });
            try {
                const result = await handoffsService.sprintStatusHandler(projectId, sprintId);
                console.log('[Handoffs] Success:', result);
                return result;
            } catch (error) {
                console.error('[Handoffs] Error:', error);
                throw error;
            }
        },
        [projectId, sprintId],
        {
            enabled: !!projectId && !!sprintId,
            errorFallback: handoffsConstants.errors.fetchFailed,
            context: "handoffs.overview",
            initialData: null,
        },
    );
    return { data: data ?? null, isLoading, refetch, setData };
};
