import { apisData } from "@/data";
import type {
    DeliveryAnalyticsFiltersInterface,
    DeliveryAnalyticsResponseInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const deliveryAnalyticsService = {
    compositeHandler: async (
        sprintId : string,
        filters?: DeliveryAnalyticsFiltersInterface,
    ): Promise<DeliveryAnalyticsResponseInterface> => {
        const { data } = await apiClient.get<{ data: DeliveryAnalyticsResponseInterface }>(
            apisData.deliveryAnalytics.composite(sprintId),
            { params: filters },
        );
        return data.data;
    },
};
