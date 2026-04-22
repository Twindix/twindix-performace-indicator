import { apisData } from "@/data";
import type { CreateTeamPayloadInterface, TeamDetailResponseInterface, TeamLiteInterface, TeamsListResponseInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const teamsService = {
    listHandler: async (): Promise<TeamsListResponseInterface> => {
        const { data } = await apiClient.get<TeamsListResponseInterface>(apisData.teams.list);
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
};
