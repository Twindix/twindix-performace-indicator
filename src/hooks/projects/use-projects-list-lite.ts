import { projectsConstants } from "@/constants";
import type { ProjectLiteInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectsListLite = () => {
    const { data, isLoading, refetch } = useQueryAction<ProjectLiteInterface[]>(
        () => projectsService.listLiteHandler(),
        [],
        {
            errorFallback: projectsConstants.errors.fetchFailed,
            initialData: [],
            context: "projects.listLite",
        },
    );

    return { projects: data ?? [], isLoading, refetch };
};
