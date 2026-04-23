import { requirementsConstants } from "@/constants/requirements";
import type { RequirementInterface } from "@/interfaces";
import { requirementsService } from "@/services";

import { useMutationAction } from "../shared";

export const useGetRequirement = () => {
    const { mutate, isLoading } = useMutationAction(
        async (taskId: string): Promise<RequirementInterface[]> => {
            const res = await requirementsService.getAllHandler(taskId);
            return res.data;
        },
        {
            errorFallback: requirementsConstants.errors.fetchFailed,
            context: "requirements.list",
        },
    );

    return { getAllHandler: mutate, isLoading };
};
