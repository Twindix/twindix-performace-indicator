import { tasksConstants } from "@/constants/tasks";
import type { UpdateTaskPayloadInterface, TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateTaskOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateTask = ({ onFieldErrors }: UseUpdateTaskOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateTaskPayloadInterface): Promise<TaskInterface> => {
            const res = await tasksService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: tasksConstants.messages.updateSuccess,
            errorFallback: tasksConstants.errors.updateFailed,
            onFieldErrors,
            context: "tasks.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
