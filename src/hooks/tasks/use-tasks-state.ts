import { useCallback, useEffect, useState } from "react";

import { tasksConstants } from "@/constants/tasks";
import type { TaskInterface, TaskStatsInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
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
        runAction(() => tasksService.listHandler(sprintId), {
            errorFallback: tasksConstants.errors.fetchFailed,
            context: "tasks.state.list",
        })
            .then((res) => { if (res) setTasks(res.data); })
            .finally(() => setIsLoading(false));
    }, [sprintId]);

    const refetchKanban = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        const res = await runAction(() => tasksService.kanbanHandler(sprintId), {
            errorFallback: tasksConstants.errors.fetchFailed,
            context: "tasks.state.kanban",
        });
        if (res) setKanban(res);
    }, [sprintId]);

    const refetchPipeline = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        const res = await runAction(() => tasksService.pipelineHandler(sprintId), {
            errorFallback: tasksConstants.errors.fetchFailed,
            context: "tasks.state.pipeline",
        });
        if (res) setPipeline(Object.values(res).flat());
    }, [sprintId]);

    const refetchStats = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        const res = await runAction(() => tasksService.statsHandler(sprintId), {
            silent: true,
            context: "tasks.state.stats",
        });
        if (res) setStats(res);
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
