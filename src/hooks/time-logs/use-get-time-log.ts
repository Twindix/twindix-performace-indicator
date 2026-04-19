import { useState } from "react";
import { toast } from "sonner";

import { timeLogsConstants } from "@/constants";
import type { TimeLogInterface, TimeLogsSummaryInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { timeLogsService } from "@/services";

export const useGetTimeLog = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getByTaskHandler = async (taskId: string): Promise<TimeLogInterface[] | null> => {
        if (!navigator.onLine) throw new Error(timeLogsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await timeLogsService.taskListHandler(taskId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getBySprintHandler = async (sprintId: string): Promise<TimeLogInterface[] | null> => {
        if (!navigator.onLine) throw new Error(timeLogsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await timeLogsService.sprintListHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getSummaryHandler = async (sprintId: string): Promise<TimeLogsSummaryInterface | null> => {
        if (!navigator.onLine) throw new Error(timeLogsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await timeLogsService.sprintSummaryHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.summaryFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getByTaskHandler, getBySprintHandler, getSummaryHandler, isLoading };
};
