import { apisData } from "@/data";
import type {
    DeliveryAnalyticsFiltersInterface,
    DeliveryAnalyticsResponseInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const deliveryAnalyticsService = {
    compositeHandler: async (
        filters?: DeliveryAnalyticsFiltersInterface,
    ): Promise<DeliveryAnalyticsResponseInterface> => {
        const { data } = await apiClient.get<DeliveryAnalyticsResponseInterface>(
            apisData.deliveryAnalytics.composite,
            { params: filters },
        );
        return data;
    },
};
