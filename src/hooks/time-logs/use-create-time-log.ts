import { timeLogsConstants } from "@/constants/time-logs";
import type { CreateTimeLogPayloadInterface, TimeLogInterface } from "@/interfaces";
import { timeLogsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateTimeLogOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateTimeLog = ({ onFieldErrors }: UseCreateTimeLogOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (taskId: string, payload: CreateTimeLogPayloadInterface): Promise<TimeLogInterface> => {
            const res = await timeLogsService.createHandler(taskId, payload);
            return res.data;
        },
        {
            successMessage: timeLogsConstants.messages.createSuccess,
            errorFallback: timeLogsConstants.errors.createFailed,
            onFieldErrors,
            context: "time-logs.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
