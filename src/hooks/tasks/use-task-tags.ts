import { tasksConstants } from "@/constants/tasks";
import { tasksService } from "@/services";

import { useMutationAction } from "../shared";

export const useTaskTags = () => {
    const { mutate: addHandler, isLoading: isAdding } = useMutationAction(
        async (taskId: string, tag: string): Promise<true> => {
            await tasksService.addTagsHandler(taskId, [tag]);
            return true;
        },
        {
            successMessage: tasksConstants.messages.tagAddSuccess,
            errorFallback: tasksConstants.errors.tagAddFailed,
            context: "tasks.tags.add",
        },
    );

    const { mutate: removeHandler, isLoading: isRemoving } = useMutationAction(
        async (taskId: string, tag: string): Promise<true> => {
            await tasksService.removeTagHandler(taskId, tag);
            return true;
        },
        {
            successMessage: tasksConstants.messages.tagRemoveSuccess,
            errorFallback: tasksConstants.errors.tagRemoveFailed,
            context: "tasks.tags.remove",
        },
    );

    return { addHandler, removeHandler, isLoading: isAdding || isRemoving };
};
