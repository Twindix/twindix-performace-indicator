import { teamsConstants } from "@/constants";
import type { TeamDetailResponseInterface, TeamInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { useMutationAction } from "../shared";

export const useGetTeam = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<TeamInterface | null> => {
            const res = await teamsService.detailHandler(id) as TeamDetailResponseInterface | TeamInterface;
            const data = (res as TeamDetailResponseInterface).data ?? (res as TeamInterface);
            return data ?? null;
        },
        {
            errorFallback: teamsConstants.errors.fetchFailed,
            context: "teams.detail",
        },
    );

    return { getHandler: mutate, isLoading };
};
