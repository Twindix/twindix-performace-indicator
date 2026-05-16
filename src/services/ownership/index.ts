import { apisData } from "@/data";
import type {
    OwnershipFeedFiltersInterface,
    OwnershipFeedResponseInterface,
    OwnershipLeaderboardEntryInterface,
    OwnershipStatsInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const ownershipService = {
    feedHandler: async (filters?: OwnershipFeedFiltersInterface): Promise<OwnershipFeedResponseInterface> => {
        const { data } = await apiClient.get<OwnershipFeedResponseInterface>(apisData.ownership.feed, {
            params: filters,
        });
        return data;
    },

    leaderboardHandler: async (): Promise<OwnershipLeaderboardEntryInterface[]> => {
        const { data } = await apiClient.get<OwnershipLeaderboardEntryInterface[] | { data: OwnershipLeaderboardEntryInterface[] }>(
            apisData.ownership.leaderboard,
        );
        return Array.isArray(data) ? data : (data.data ?? []);
    },

    statsHandler: async (): Promise<OwnershipStatsInterface> => {
        const { data } = await apiClient.get<OwnershipStatsInterface | { data: OwnershipStatsInterface }>(
            apisData.ownership.stats,
        );
        return "data" in (data as object) ? (data as { data: OwnershipStatsInterface }).data : (data as OwnershipStatsInterface);
    },
};
