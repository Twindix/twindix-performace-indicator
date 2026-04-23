import { blockersConstants } from "@/constants";
import { blockersService } from "@/services";

import { useMutationAction } from "../shared";

export const useUnlinkBlockerTask = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, taskId: string): Promise<true> => {
            await blockersService.unlinkTaskHandler(id, taskId);
            return true;
        },
        {
            successMessage: blockersConstants.messages.unlinkTaskSuccess,
            errorFallback: blockersConstants.errors.unlinkTaskFailed,
            context: "blockers.unlink-task",
        },
    );

    return { unlinkHandler: mutate, isLoading };
};
