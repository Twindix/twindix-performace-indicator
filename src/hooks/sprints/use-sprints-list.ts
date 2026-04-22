import { useCallback } from "react";

import { sprintsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { sprintsService } from "@/services";

import { useQueryAction } from "../shared";

export const useSprintsList = () => {
    const { data, isLoading, refetch, setData } = useQueryAction<SprintInterface[]>(
        async () => (await sprintsService.listHandler()).data,
        [],
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
