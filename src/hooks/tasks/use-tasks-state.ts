import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { TaskInterface, TaskStatsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTasksState = (sprintId: string | null | undefined) => {
    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [kanban, setKanban] = useState<Record<string, TaskInterface[]>>({});
    const [pipeline, setPipeline] = useState<TaskInterface[]>([]);
    const [stats, setStats] = useState<TaskStatsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!sprintId) { setTasks([]); return; }
        setIsLoading(true);
        tasksService.listHandler(sprintId)
            .then((res) => setTasks(res.data))
            .catch((err) => toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed)))
            .finally(() => setIsLoading(false));
    }, [sprintId]);

    const refetchKanban = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.kanbanHandler(sprintId);
            setKanban(res);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
    }, [sprintId]);

    const refetchPipeline = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.pipelineHandler(sprintId);
            setPipeline(Object.values(res).flat());
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
    }, [sprintId]);

    const refetchStats = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.statsHandler(sprintId);
            setStats(res);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
    }, [sprintId]);

    const patchTaskLocal = useCallback((id: string, updates: Partial<TaskInterface>) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const addTaskLocal = useCallback((task: TaskInterface) => {
        setTasks((prev) => [...prev, task]);
    }, []);

    const removeTaskLocal = useCallback((id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const setKanbanLocal = useCallback((data: Record<string, TaskInterface[]>) => {
        setKanban(data);
    }, []);

    const setPipelineLocal = useCallback((data: TaskInterface[]) => {
        setPipeline(data);
    }, []);

    return {
        tasks,
        kanban,
        pipeline,
        stats,
        isLoading,
        refetchKanban,
        refetchPipeline,
        refetchStats,
        patchTaskLocal,
        addTaskLocal,
        removeTaskLocal,
        setKanbanLocal,
        setPipelineLocal,
    };
};