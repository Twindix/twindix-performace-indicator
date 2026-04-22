import { blockersConstants } from "@/constants";
import type { BlockerInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { useMutationAction } from "../shared";

export const useLinkBlockerTasks = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, taskIds: string[]): Promise<BlockerInterface> => {
            const res = await blockersService.linkTasksHandler(id, taskIds);
            return res.data;
        },
        {
            successMessage: blockersConstants.messages.linkTasksSuccess,
            errorFallback: blockersConstants.errors.linkTasksFailed,
            context: "blockers.link-tasks",
        },
    );

    return { linkHandler: mutate, isLoading };
};
