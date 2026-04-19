import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskInterface, TaskStatsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskViews = () => {
    const [isLoading, setIsLoading] = useState(false);

    const kanbanHandler = async (sprintId: string): Promise<Record<string, TaskInterface[]> | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.kanbanHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const pipelineHandler = async (sprintId: string): Promise<TaskInterface[] | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.pipelineHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const pipelineCountsHandler = async (sprintId: string): Promise<Record<string, number> | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.pipelineCountsHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const statsHandler = async (sprintId: string): Promise<TaskStatsInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.statsHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const transitionCriteriaHandler = async (taskId: string): Promise<TaskInterface[] | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.transitionCriteriaHandler(taskId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { kanbanHandler, pipelineHandler, pipelineCountsHandler, statsHandler, transitionCriteriaHandler, isLoading };
};
