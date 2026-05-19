import type { FeatureInterface } from "@/interfaces";
import { featuresService } from "@/services";

import { useQueryAction } from "../shared";

export const useOwnershipFeed = (projectId: string) => {
    const { data, isLoading, refetch } = useQueryAction<FeatureInterface[] | null>(
        async () => {
            const result = await featuresService.listHandler(projectId);
            return result.data;
        },
        [projectId],
        {
            enabled: !!projectId,
            context: "ownership.feed",
            initialData: null,
        },
    );
    return { items: data ?? [], isLoading, refetch };
};
