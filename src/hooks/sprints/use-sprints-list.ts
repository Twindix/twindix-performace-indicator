import { useCallback } from "react";

import { sprintsConstants } from "@/constants";
import type { PaginationMetaInterface, SprintInterface } from "@/interfaces";
import { projectsService } from "@/services";
import { useProjectStore } from "@/store";

import { usePaginatedQuery } from "../shared";

export interface UseSprintsListOptions {
    initialPerPage?: number;
}

const synthesizeMeta = (items: SprintInterface[]): PaginationMetaInterface => ({
    current_page: 1,
    last_page: 1,
    per_page: items.length || 1,
    total: items.length,
    from: items.length > 0 ? 1 : null,
    to: items.length > 0 ? items.length : null,
});

export const useSprintsList = ({ initialPerPage }: UseSprintsListOptions = {}) => {
    const activeProjectId = useProjectStore((s) => s.activeProjectId);

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<SprintInterface>(
        async () => {
            const all = await projectsService.sprintsHandler(activeProjectId);
            return { data: all, meta: synthesizeMeta(all) };
        },
        [activeProjectId],
        {
            enabled: !!activeProjectId,
            errorFallback: sprintsConstants.errors.fetchFailed,
            context: "sprints.list",
            initialPerPage,
        },
    );

    const patchSprintLocal = useCallback((sprint: SprintInterface) => {
        setItems((prev) => {
            const exists = prev.some((s) => s.id === sprint.id);
            return exists ? prev.map((s) => (s.id === sprint.id ? sprint : s)) : [...prev, sprint];
        });
    }, [setItems]);

    const removeSprintLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((s) => s.id !== id));
    }, [setItems]);

    return { sprints: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchSprintLocal, removeSprintLocal };
};
