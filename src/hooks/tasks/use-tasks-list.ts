import { useCallback } from "react";

import { tasksConstants } from "@/constants";
import type { KanbanBoardInterface, TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useQueryAction } from "../shared";

export interface TasksListFilters {
    status?: string;
    assigned_to?: string;
    priority?: string;
    type?: string;
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
}

const buildParams = (filters: TasksListFilters): TasksListFilters => {
    const { status, assigned_to, priority, type, search, per_page, sort_by, sort_order } = filters;
    const params: TasksListFilters = {};
    if (status && status !== "all") params.status = status;
    if (assigned_to && assigned_to !== "all") params.assigned_to = assigned_to;
    if (priority && priority !== "all") params.priority = priority;
    if (type && type !== "all") params.type = type;
    if (search) params.search = search;
    if (per_page) params.per_page = per_page;
    if (sort_by) params.sort_by = sort_by;
    if (sort_order) params.sort_order = sort_order;
    return params;
};

export const useTasksList = (sprintId: string, filters: TasksListFilters = {}) => {
    const { status, assigned_to, priority, type, search, per_page, sort_by, sort_order } = filters;

    const { data, isLoading, refetch, setData } = useQueryAction<TaskInterface[]>(
        async () => {
            if (!sprintId) return [];
            const res = await tasksService.listHandler(sprintId, buildParams(filters));
            return res.data;
        },
        [sprintId, status, assigned_to, priority, type, search, per_page, sort_by, sort_order],
        {
            enabled: !!sprintId,
            errorFallback: tasksConstants.errors.fetchFailed,
            initialData: [],
            context: "tasks.list",
        },
    );

    const tasks = data ?? [];

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setData((prev) => (prev ?? []).map((t) => (t.id === task.id ? task : t)));
    }, [setData]);

    const removeTaskLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((t) => t.id !== id));
    }, [setData]);

    const addTaskLocal = useCallback((task: TaskInterface) => {
        setData((prev) => [task, ...(prev ?? [])]);
    }, [setData]);

    const toKanban = useCallback((): KanbanBoardInterface => {
        const board: KanbanBoardInterface = {};
        for (const task of tasks) {
            const col = task.status ?? "backlog";
            board[col] = [...(board[col] ?? []), task];
        }
        return board;
    }, [tasks]);

    return { tasks, isLoading, refetch, patchTaskLocal, removeTaskLocal, addTaskLocal, toKanban };
};
