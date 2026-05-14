import { deliveryAnalyticsConstants } from "@/constants";
import type {
    DeliveryAnalyticsFiltersInterface,
    DeliveryAnalyticsResponseInterface,
} from "@/interfaces";
import { deliveryAnalyticsService } from "@/services";

import { useQueryAction } from "../shared";

export const useDeliveryAnalytics = (filters?: DeliveryAnalyticsFiltersInterface) => {
    const { from, to, project_id } = filters ?? {};

    const { data, isLoading, refetch } = useQueryAction<DeliveryAnalyticsResponseInterface | null>(
        () => deliveryAnalyticsService.compositeHandler({ from, to, project_id }),
        [from, to, project_id],
        {
            errorFallback: deliveryAnalyticsConstants.errors.fetchFailed,
            context: "delivery-analytics.composite",
            initialData: null,
        },
    );

    return {
        data: data ?? null,
        isLoading,
        refetch,
    };
};
