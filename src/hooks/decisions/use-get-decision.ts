import { decisionsConstants } from "@/constants";
import type { DecisionInterface } from "@/interfaces";
import { decisionsService } from "@/services";

import { useMutationAction } from "../shared";

export const useGetDecision = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<DecisionInterface> => {
            const res = await decisionsService.detailHandler(id);
            return res.data;
        },
        {
            errorFallback: decisionsConstants.errors.fetchDetailFailed,
            context: "decisions.detail",
        },
    );

    return { getHandler: mutate, isLoading };
};
