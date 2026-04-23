import { timeLogsConstants } from "@/constants/time-logs";
import type { UpdateTimeLogPayloadInterface, TimeLogInterface } from "@/interfaces";
import { timeLogsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateTimeLogOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateTimeLog = ({ onFieldErrors }: UseUpdateTimeLogOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateTimeLogPayloadInterface): Promise<TimeLogInterface> => {
            const res = await timeLogsService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: timeLogsConstants.messages.updateSuccess,
            errorFallback: timeLogsConstants.errors.updateFailed,
            onFieldErrors,
            context: "time-logs.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
