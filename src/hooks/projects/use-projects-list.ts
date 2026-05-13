import { useCallback } from "react";

import { projectsConstants } from "@/constants";
import type { ProjectInterface } from "@/interfaces";
import { projectsService } from "@/services";

import { usePaginatedQuery } from "../shared";

export interface UseProjectsListOptions {
    status?: string;
    initialPerPage?: number;
}

export const useProjectsList = ({ status, initialPerPage }: UseProjectsListOptions = {}) => {
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<ProjectInterface>(
        ({ page, per_page }) => projectsService.listHandler({ page, per_page, status }),
        [status],
        {
            errorFallback: projectsConstants.errors.fetchFailed,
            context: "projects.list",
            initialPerPage,
        },
    );

    const patchProjectLocal = useCallback((updated: ProjectInterface) => {
        setItems((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    }, [setItems]);

    const removeProjectLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    }, [setItems]);

    const prependProjectLocal = useCallback((created: ProjectInterface) => {
        setItems((prev) => [created, ...prev]);
    }, [setItems]);

    return { projects: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchProjectLocal, removeProjectLocal, prependProjectLocal };
};
