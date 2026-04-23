import { useCallback, useState } from "react";

import { tasksConstants } from "@/constants/tasks";
import type { KanbanBoardInterface, TaskInterface, TaskStatsInterface, TransitionCriteriaResponseInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { tasksService } from "@/services";

export const useTaskViews = () => {
    const [isLoading, setIsLoading] = useState(false);

    const kanbanHandler = useCallback(async (sprintId: string): Promise<KanbanBoardInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => tasksService.kanbanHandler(sprintId), {
                errorFallback: tasksConstants.errors.fetchFailed,
                context: "tasks.views.kanban",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const pipelineHandler = useCallback(async (sprintId: string): Promise<Record<string, TaskInterface[]> | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => tasksService.pipelineHandler(sprintId), {
                errorFallback: tasksConstants.errors.fetchFailed,
                context: "tasks.views.pipeline",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const statsHandler = useCallback(async (sprintId: string): Promise<TaskStatsInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => tasksService.statsHandler(sprintId), {
                silent: true,
                context: "tasks.views.stats",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const transitionCriteriaHandler = useCallback(async (taskId: string, targetPhase: string): Promise<TransitionCriteriaResponseInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => tasksService.transitionCriteriaHandler(taskId, targetPhase), {
                errorFallback: tasksConstants.errors.fetchFailed,
                context: "tasks.views.transition",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        kanbanHandler,
        pipelineHandler,
        statsHandler,
        transitionCriteriaHandler,
        isLoading,
    };
};
