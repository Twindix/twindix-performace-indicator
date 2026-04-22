import { useCallback } from "react";

import { tasksConstants } from "@/constants";
import type { KanbanBoardInterface, TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useQueryAction } from "../shared";

export const useKanban = (sprintId: string) => {
    const { data, isLoading, refetch, setData } = useQueryAction<KanbanBoardInterface>(
        async () => (sprintId ? await tasksService.kanbanHandler(sprintId) : {}),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: tasksConstants.errors.fetchFailed,
            initialData: {},
            context: "tasks.kanban",
        },
    );

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setData((prev) => {
            const next: KanbanBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev ?? {})) {
                next[col] = tasks.filter((t) => t.id !== task.id);
            }
            const targetCol = task.status ?? "backlog";
            next[targetCol] = [task, ...(next[targetCol] ?? [])];
            return next;
        });
    }, [setData]);

    const removeTaskLocal = useCallback((id: string) => {
        setData((prev) => {
            const next: KanbanBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev ?? {})) {
                next[col] = tasks.filter((t) => t.id !== id);
            }
            return next;
        });
    }, [setData]);

    return { kanban: data ?? {}, isLoading, refetch, patchTaskLocal, removeTaskLocal };
};
