import { useCallback } from "react";

import { tasksConstants } from "@/constants";
import type { KanbanBoardInterface, TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { usePaginatedQuery } from "../shared";

export interface TasksListFilters {
    status?: string;
    assigned_to?: string;
    priority?: string;
    type?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    initialPerPage?: number;
}

export const useTasksList = (sprintId: string, filters: TasksListFilters = {}) => {
    const { status, assigned_to, priority, type, search, sort_by, sort_order, initialPerPage = 100 } = filters;

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<TaskInterface>(
        ({ page, per_page }) => tasksService.listHandler(sprintId, {
            status, assigned_to, priority, type, search, sort_by, sort_order,
            page, per_page,
        }),
        [sprintId, status, assigned_to, priority, type, search, sort_by, sort_order],
        {
            enabled: !!sprintId,
            errorFallback: tasksConstants.errors.fetchFailed,
            context: "tasks.list",
            initialPerPage,
        },
    );

    const tasks = items;

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setItems((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }, [setItems]);

    const removeTaskLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((t) => t.id !== id));
    }, [setItems]);

    const addTaskLocal = useCallback((task: TaskInterface) => {
        setItems((prev) => [task, ...prev]);
    }, [setItems]);

    const toKanban = useCallback((): KanbanBoardInterface => {
        const board: KanbanBoardInterface = {};
        for (const task of tasks) {
            const col = task.status ?? "backlog";
            board[col] = [...(board[col] ?? []), task];
        }
        return board;
    }, [tasks]);

    return { tasks, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchTaskLocal, removeTaskLocal, addTaskLocal, toKanban };
};
