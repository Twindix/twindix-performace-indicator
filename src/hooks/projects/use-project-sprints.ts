import { projectsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectSprints = (projectId: string | null | undefined) => {
    const enabled = !!projectId;
    const { data, isLoading, refetch } = useQueryAction<SprintInterface[]>(
        () => (projectId ? projectsService.sprintsHandler(projectId) : Promise.resolve([])),
        [projectId],
        {
            enabled,
            errorFallback: projectsConstants.errors.sprintsFetchFailed,
            initialData: [],
            context: "projects.sprints",
        },
    );

    return { sprints: data ?? [], isLoading, refetch };
};
