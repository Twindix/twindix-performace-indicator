import { timeLogsConstants } from "@/constants/time-logs";
import { timeLogsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteTimeLog = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await timeLogsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: timeLogsConstants.messages.deleteSuccess,
            errorFallback: timeLogsConstants.errors.deleteFailed,
            context: "time-logs.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
