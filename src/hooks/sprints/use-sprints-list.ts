import { useCallback } from "react";

import { sprintsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { projectsService, sprintsService } from "@/services";
import { useProjectStore } from "@/store";

import { useQueryAction } from "../shared";

export const useSprintsList = () => {
    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const { data, isLoading, refetch, setData } = useQueryAction<SprintInterface[]>(
        async () => {
            if (activeProjectId) return projectsService.sprintsHandler(activeProjectId);
            return (await sprintsService.listHandler()).data;
        },
        [activeProjectId],
        {
            errorFallback: sprintsConstants.errors.fetchFailed,
            initialData: [],
            context: "sprints.list",
        },
    );

    const patchSprintLocal = useCallback((sprint: SprintInterface) => {
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((s) => s.id === sprint.id);
            return exists ? arr.map((s) => (s.id === sprint.id ? sprint : s)) : [...arr, sprint];
        });
    }, [setData]);

    const removeSprintLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((s) => s.id !== id));
    }, [setData]);

    return { sprints: data ?? [], isLoading, refetch, patchSprintLocal, removeSprintLocal };
};
