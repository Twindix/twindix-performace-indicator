import { tasksConstants } from "@/constants";
import type { CreateTaskPayloadInterface, TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateTaskOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateTask = ({ onFieldErrors }: UseCreateTaskOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (sprintId: string, payload: CreateTaskPayloadInterface): Promise<TaskInterface> => {
            const res = await tasksService.createHandler(sprintId, payload);
            return res.data;
        },
        {
            successMessage: tasksConstants.messages.createSuccess,
            errorFallback: tasksConstants.errors.createFailed,
            onFieldErrors,
            context: "tasks.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
