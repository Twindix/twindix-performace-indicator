import { alertsConstants } from "@/constants";
import { alertsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteAlert = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await alertsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: alertsConstants.messages.deleteSuccess,
            errorFallback: alertsConstants.errors.deleteFailed,
            context: "alerts.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
