import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { KanbanBoardInterface, TaskInterface, TaskStatsInterface, TransitionCriteriaResponseInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskViews = () => {
    const [isLoading, setIsLoading] = useState(false);

    const kanbanHandler = useCallback(async (sprintId: string): Promise<KanbanBoardInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.kanbanHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const pipelineHandler = useCallback(async (sprintId: string): Promise<Record<string, TaskInterface[]> | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.pipelineHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const statsHandler = useCallback(async (sprintId: string): Promise<TaskStatsInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.statsHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const transitionCriteriaHandler = useCallback(async (taskId: string, targetPhase: string): Promise<TransitionCriteriaResponseInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.transitionCriteriaHandler(taskId, targetPhase);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
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