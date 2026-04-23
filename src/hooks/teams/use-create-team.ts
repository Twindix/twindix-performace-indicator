import { teamsConstants } from "@/constants";
import type { CreateTeamPayloadInterface, TeamInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateTeamOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateTeam = ({ onFieldErrors }: UseCreateTeamOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (payload: CreateTeamPayloadInterface): Promise<TeamInterface> => {
            const res = await teamsService.createHandler(payload);
            return res.data;
        },
        {
            successMessage: teamsConstants.messages.createSuccess,
            errorFallback: teamsConstants.errors.createFailed,
            onFieldErrors,
            context: "team.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
