import { apisData } from "@/data";
import type {
    WorkloadByMemberRowInterface,
    WorkloadByProjectRowInterface,
    WorkloadBySprintRowInterface,
    WorkloadByTeamRowInterface,
    WorkloadMemberFiltersInterface,
    WorkloadResponseInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const workloadService = {
    byProjectHandler: async (): Promise<WorkloadResponseInterface<WorkloadByProjectRowInterface>> => {
        const { data } = await apiClient.get<WorkloadResponseInterface<WorkloadByProjectRowInterface>>(
            apisData.workload.byProject,
        );
        return data;
    },

    bySprintHandler: async (): Promise<WorkloadResponseInterface<WorkloadBySprintRowInterface>> => {
        const { data } = await apiClient.get<WorkloadResponseInterface<WorkloadBySprintRowInterface>>(
            apisData.workload.bySprint,
        );
        return data;
    },

    byTeamHandler: async (): Promise<WorkloadResponseInterface<WorkloadByTeamRowInterface>> => {
        const { data } = await apiClient.get<WorkloadResponseInterface<WorkloadByTeamRowInterface>>(
            apisData.workload.byTeam,
        );
        return data;
    },

    byMemberHandler: async (
        filters?: WorkloadMemberFiltersInterface,
    ): Promise<WorkloadResponseInterface<WorkloadByMemberRowInterface>> => {
        const { data } = await apiClient.get<WorkloadResponseInterface<WorkloadByMemberRowInterface>>(
            apisData.workload.byMember,
            { params: filters },
        );
        return data;
    },
};
