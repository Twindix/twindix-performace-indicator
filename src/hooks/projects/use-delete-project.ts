import { projectsConstants } from "@/constants";
import { projectsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteProject = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await projectsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: projectsConstants.messages.deleteSuccess,
            errorFallback: projectsConstants.errors.deleteFailed,
            context: "projects.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
