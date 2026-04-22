import { blockersConstants } from "@/constants";
import type { BlockerInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { useMutationAction } from "../shared";

export const useEscalateBlocker = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<BlockerInterface> => {
            const res = await blockersService.escalateHandler(id);
            return res.data;
        },
        {
            successMessage: blockersConstants.messages.escalateSuccess,
            errorFallback: blockersConstants.errors.escalateFailed,
            context: "blockers.escalate",
        },
    );

    return { escalateHandler: mutate, isLoading };
};
