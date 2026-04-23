import { projectsConstants } from "@/constants";
import type { CreateProjectPayloadInterface, ProjectInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export const useCreateProject = ({ onFieldErrors }: { onFieldErrors?: (e: FieldErrors) => void } = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (payload: CreateProjectPayloadInterface): Promise<ProjectInterface> => projectsService.createHandler(payload),
        {
            successMessage: projectsConstants.messages.createSuccess,
            errorFallback: projectsConstants.errors.createFailed,
            onFieldErrors,
            context: "projects.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
