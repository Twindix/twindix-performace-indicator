import { blockersConstants } from "@/constants";
import type { BlockerInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { useMutationAction } from "../shared";

export const useResolveBlocker = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<BlockerInterface> => {
            const res = await blockersService.resolveHandler(id);
            return res.data;
        },
        {
            successMessage: blockersConstants.messages.resolveSuccess,
            errorFallback: blockersConstants.errors.resolveFailed,
            context: "blockers.resolve",
        },
    );

    return { resolveHandler: mutate, isLoading };
};
