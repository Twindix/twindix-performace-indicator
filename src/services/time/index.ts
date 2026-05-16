import { apisData } from "@/data";
import type {
    TimeAggregationResponseInterface,
    TimeByMemberRowInterface,
    TimeByProjectRowInterface,
    TimeBySprintRowInterface,
    TimeByTeamRowInterface,
    TimeSummaryInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const timeService = {
    byProjectHandler: async (): Promise<TimeAggregationResponseInterface<TimeByProjectRowInterface>> => {
        const { data } = await apiClient.get<TimeAggregationResponseInterface<TimeByProjectRowInterface>>(
            apisData.time.byProject,
        );
        return data;
    },

    bySprintHandler: async (): Promise<TimeAggregationResponseInterface<TimeBySprintRowInterface>> => {
        const { data } = await apiClient.get<TimeAggregationResponseInterface<TimeBySprintRowInterface>>(
            apisData.time.bySprint,
        );
        return data;
    },

    byTeamHandler: async (): Promise<TimeAggregationResponseInterface<TimeByTeamRowInterface>> => {
        const { data } = await apiClient.get<TimeAggregationResponseInterface<TimeByTeamRowInterface>>(
            apisData.time.byTeam,
        );
        return data;
    },

    byMemberHandler: async (): Promise<TimeAggregationResponseInterface<TimeByMemberRowInterface>> => {
        const { data } = await apiClient.get<TimeAggregationResponseInterface<TimeByMemberRowInterface>>(
            apisData.time.byMember,
        );
        return data;
    },

    summaryHandler: async (): Promise<TimeSummaryInterface> => {
        const { data } = await apiClient.get<TimeSummaryInterface>(apisData.time.summary);
        return data;
    },
};
