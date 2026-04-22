import { teamsConstants } from "@/constants";
import type { TeamDetailResponseInterface, UpdateTeamPayloadInterface } from "@/interfaces";
import { teamsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export const useUpdateTeam = ({ onFieldErrors }: { onFieldErrors?: (e: FieldErrors) => void } = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateTeamPayloadInterface): Promise<TeamDetailResponseInterface> =>
            teamsService.updateHandler(id, payload),
        {
            successMessage: teamsConstants.messages.updateSuccess,
            errorFallback: teamsConstants.errors.updateFailed,
            onFieldErrors,
            context: "teams.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
