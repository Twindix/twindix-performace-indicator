import { projectsConstants } from "@/constants";
import type { ProjectInterface, UpdateProjectPayloadInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export const useUpdateProject = ({ onFieldErrors }: { onFieldErrors?: (e: FieldErrors) => void } = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateProjectPayloadInterface): Promise<ProjectInterface> =>
            projectsService.updateHandler(id, payload),
        {
            successMessage: projectsConstants.messages.updateSuccess,
            errorFallback: projectsConstants.errors.updateFailed,
            onFieldErrors,
            context: "projects.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
