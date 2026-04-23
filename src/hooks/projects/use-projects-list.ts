import { projectsConstants } from "@/constants";
import type { ProjectInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { useQueryAction } from "../shared";

export const useProjectsList = (params?: { status?: string }) => {
    const { data, isLoading, refetch, setData } = useQueryAction<ProjectInterface[]>(
        () => projectsService.listHandler(params),
        [params?.status],
        {
            errorFallback: projectsConstants.errors.fetchFailed,
            initialData: [],
            context: "projects.list",
        },
    );

    const patchProjectLocal = (updated: ProjectInterface) =>
        setData((prev) => (prev ?? []).map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

    const removeProjectLocal = (id: string) =>
        setData((prev) => (prev ?? []).filter((p) => p.id !== id));

    const prependProjectLocal = (created: ProjectInterface) =>
        setData((prev) => [created, ...(prev ?? [])]);

    return { projects: data ?? [], isLoading, refetch, patchProjectLocal, removeProjectLocal, prependProjectLocal };
};
