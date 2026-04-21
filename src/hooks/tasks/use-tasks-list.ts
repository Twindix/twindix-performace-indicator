import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { KanbanBoardInterface, TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

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

export const useTasksList = (sprintId: string, filters: TasksListFilters = {}) => {
    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { status, assigned_to, priority, type, search, per_page, sort_by, sort_order } = filters;

    const refetch = useCallback(async () => {
        if (!sprintId) { setTasks([]); setIsLoading(false); return; }
        setIsLoading(true);
        const params: TasksListFilters = {};
        if (status && status !== "all") params.status = status;
        if (assigned_to && assigned_to !== "all") params.assigned_to = assigned_to;
        if (priority && priority !== "all") params.priority = priority;
        if (type && type !== "all") params.type = type;
        if (search) params.search = search;
        if (per_page) params.per_page = per_page;
        if (sort_by) params.sort_by = sort_by;
        if (sort_order) params.sort_order = sort_order;
        try {
            const res = await tasksService.listHandler(sprintId, params);
            setTasks(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId, status, assigned_to, priority, type, search, per_page, sort_by, sort_order]);

    useEffect(() => { refetch(); }, [refetch]);

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
    }, []);

    const removeTaskLocal = useCallback((id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addTaskLocal = useCallback((task: TaskInterface) => {
        setTasks((prev) => [task, ...prev]);
    }, []);

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
