import { projectsConstants } from "@/constants";
import type { ProjectLiteInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useSessionCachedList } from "../shared";

export const useProjectsListLite = () => {
    const { data, isLoading, refetch } = useSessionCachedList<ProjectLiteInterface>(
        "projects.lite",
        () => projectsService.listLiteHandler(),
        { errorFallback: projectsConstants.errors.fetchFailed, context: "projects.listLite" },
    );
    return { projects: data, isLoading, refetch };
};
