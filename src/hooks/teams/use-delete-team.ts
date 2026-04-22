import { teamsConstants } from "@/constants";
import { teamsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteTeam = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await teamsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: teamsConstants.messages.deleteSuccess,
            errorFallback: teamsConstants.errors.deleteFailed,
            context: "teams.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
