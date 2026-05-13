import { apisData } from "@/data";
import type { CreateTeamPayloadInterface, TeamDetailResponseInterface, TeamLiteInterface, TeamsListFiltersInterface, TeamsListResponseInterface, UpdateTeamPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const teamsService = {
    listHandler: async (params?: TeamsListFiltersInterface): Promise<TeamsListResponseInterface> => {
        const { data } = await apiClient.get<TeamsListResponseInterface>(apisData.teams.list, { params });
        // Backend hasn't shipped pagination for /teams yet — synthesize single-page meta
        // so the LoadMore UI still renders. Remove the fallback once the API returns `meta`.
        if (!data.meta) {
            const items = data.data ?? [];
            return {
                data: items,
                meta: {
                    current_page: 1,
                    last_page: 1,
                    per_page: items.length || 1,
                    total: items.length,
                    from: items.length > 0 ? 1 : null,
                    to: items.length > 0 ? items.length : null,
                },
            };
        }
        return data;
    },

    listLiteHandler: async (): Promise<TeamLiteInterface[]> => {
        const res = await apiClient.get<TeamLiteInterface[] | { data: TeamLiteInterface[] }>(apisData.teams.listLite);
        return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    },

    createHandler: async (payload: CreateTeamPayloadInterface): Promise<TeamDetailResponseInterface> => {
        const { data } = await apiClient.post<TeamDetailResponseInterface>(apisData.teams.create, payload);
        return data;
    },

    detailHandler: async (id: string): Promise<TeamDetailResponseInterface> => {
        const { data } = await apiClient.get<TeamDetailResponseInterface>(apisData.teams.detail(id));
        return data;
    },

    updateHandler: async (id: string, payload: UpdateTeamPayloadInterface): Promise<TeamDetailResponseInterface> => {
        const { data } = await apiClient.put<TeamDetailResponseInterface>(apisData.teams.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.teams.delete(id));
    },
};
