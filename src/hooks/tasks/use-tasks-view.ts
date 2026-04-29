import { useCallback, useEffect, useMemo, useState } from "react";

import {
    useGetTask,
    usePermissions,
    useTaskStats,
    useUpdateTaskStatus,
    useUsersListLite,
} from "@/hooks";
import type {
    TaskInterface,
    TaskStatsInterface,
    UseTasksViewReturnInterface,
} from "@/interfaces";
import { useAuthStore, useSprintStore } from "@/store";

import { usePipeline } from "./use-pipeline";
import { useTasksDialogs } from "./use-tasks-dialogs";
import { useTasksFilters } from "./use-tasks-filters";
import { useTasksList } from "./use-tasks-list";

export const useTasksView = (): UseTasksViewReturnInterface => {
    const { activeSprintId } = useSprintStore();
    const permissions = usePermissions();
    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id ?? "";

    const filters = useTasksFilters();
    const [viewMode, setViewMode] = useState<"board" | "pipeline">("board");

    const apiFilters = {
        status: filters.values.status !== "all" && filters.values.status !== "blocked" ? filters.values.status : undefined,
        assigned_to: filters.values.assignee !== "all" ? filters.values.assignee : undefined,
        priority: filters.values.priority !== "all" ? filters.values.priority : undefined,
        type: filters.values.type !== "all" ? filters.values.type : undefined,
        search: filters.debouncedSearch || undefined,
    };

    const {
        tasks,
        isLoading: tasksLoading,
        patchTaskLocal,
        removeTaskLocal,
        addTaskLocal,
        toKanban,
        refetch,
    } = useTasksList(activeSprintId, apiFilters);

    const { pipeline, isLoading: pipelineLoading } = usePipeline(activeSprintId);

    const { statsHandler } = useTaskStats();
    const { updateStatusHandler, isLoading: isUpdatingStatus } = useUpdateTaskStatus();
    const { getHandler: getTaskHandler } = useGetTask();
    const { users } = useUsersListLite();

    const [stats, setStats] = useState<TaskStatsInterface | null>(null);

    const fetchTask = useCallback(
        async (taskId: string): Promise<TaskInterface | null> => (await getTaskHandler(taskId)) as TaskInterface | null,
        [getTaskHandler],
    );

    const dialogs = useTasksDialogs({ onTaskFetch: fetchTask, onPatchTask: patchTaskLocal });

    useEffect(() => {
        if (!activeSprintId) return;
        statsHandler(activeSprintId).then((res) => { if (res) setStats(res); });
    }, [activeSprintId, statsHandler]);

    const kanban = useMemo(() => {
        const board = toKanban();
        if (filters.values.status === "blocked") {
            for (const col of Object.keys(board)) {
                board[col] = board[col].filter((t) => t.is_blocked);
            }
        }
        return board;
    }, [toKanban, filters.values.status]);

    const filteredPipeline = useMemo(() => {
        if (filters.values.status === "blocked") {
            const result = { ...pipeline };
            for (const col of Object.keys(result)) {
                result[col] = result[col].filter((t) => t.is_blocked);
            }
            return result;
        }
        return pipeline;
    }, [pipeline, filters.values.status]);

    const filteredCount = viewMode === "board"
        ? Object.values(kanban).reduce((sum, arr) => sum + arr.length, 0)
        : Object.values(filteredPipeline).reduce((sum, arr) => sum + arr.length, 0);

    const isLoading = tasksLoading || (viewMode === "pipeline" && pipelineLoading);
    const computedStats = {
        total: stats?.total_tasks ?? tasks.length,
        donePoints: stats?.story_points.used ?? 0,
        totalPoints: stats?.story_points.total ?? 0,
        blocked: stats?.blocked_count ?? tasks.filter((t) => t.is_blocked).length,
    };

    const onConfirmTransition = useCallback(async () => {
        const { task, targetPhase, close } = dialogs.transition;
        if (!task || !targetPhase) return;
        const ok = await updateStatusHandler(task.id, targetPhase);
        if (ok) {
            const fresh = await getTaskHandler(task.id);
            if (fresh) {
                patchTaskLocal(fresh as TaskInterface);
                dialogs.setSelectedTask((prev) => (prev && prev.id === fresh.id ? (fresh as TaskInterface) : prev) as TaskInterface | null);
            }
            close();
        }
    }, [dialogs, updateStatusHandler, getTaskHandler, patchTaskLocal]);

    return {
        permissions,
        activeSprintId,
        currentUserId,
        users,
        isLoading,
        isEmpty: filteredCount === 0,
        tasks,
        kanban,
        pipeline: filteredPipeline,
        stats: computedStats,
        filters,
        dialogs,
        viewMode: { value: viewMode, onChange: setViewMode },
        patchTaskLocal,
        removeTaskLocal,
        addTaskLocal,
        refetch,
        onConfirmTransition,
        isUpdatingStatus,
    };
};
