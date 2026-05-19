import { deliveryAnalyticsConstants } from "@/constants";
import type {
    DeliveryAnalyticsFiltersInterface,
    DeliveryAnalyticsResponseInterface,
} from "@/interfaces";
import { analyticsCache } from "@/lib/analytics-cache";
import { deliveryAnalyticsService } from "@/services";

import { useQueryAction } from "../shared";

export const useDeliveryAnalytics = (sprintId: string, filters?: DeliveryAnalyticsFiltersInterface) => {
    const { from, to, project_id } = filters ?? {};

    const { data, isLoading, refetch } = useQueryAction<DeliveryAnalyticsResponseInterface | null>(
        async () => {
            const key = `delivery-analytics:${sprintId}:${from ?? ""}:${to ?? ""}:${project_id ?? ""}`;
            const cached = analyticsCache.get<DeliveryAnalyticsResponseInterface>(key);
            if (cached) return cached;
            const result = await deliveryAnalyticsService.compositeHandler(sprintId, { from, to, project_id });
            analyticsCache.set(key, result);
            return result;
        },
        [sprintId, from, to, project_id],
        {
            enabled: !!sprintId,
            errorFallback: deliveryAnalyticsConstants.errors.fetchFailed,
            context: "delivery-analytics.composite",
            initialData: null,
        },
    );

    return { data: data ?? null, isLoading, refetch };
};
