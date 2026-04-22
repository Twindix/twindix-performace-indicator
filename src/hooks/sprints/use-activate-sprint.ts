import { sprintsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useMutationAction } from "../shared";

export const useActivateSprint = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<SprintInterface> => {
            const res = await sprintsService.activateHandler(id);
            return res.data;
        },
        {
            successMessage: sprintsConstants.messages.activateSuccess,
            errorFallback: sprintsConstants.errors.activateFailed,
            context: "sprint.activate",
        },
    );

    return { activateHandler: mutate, isLoading };
};
