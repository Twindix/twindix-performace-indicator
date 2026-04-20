import { useCallback, useState } from "react";
import { toast } from "sonner";

import { timeLogsConstants } from "@/constants/time-logs";
import type { TimeLogInterface, TimeLogsSummaryInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { timeLogsService } from "@/services";

export const useGetTimeLog = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getByTaskHandler = useCallback(async (taskId: string): Promise<TimeLogInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await timeLogsService.getByTaskHandler(taskId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getBySprintHandler = useCallback(async (sprintId: string): Promise<TimeLogInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await timeLogsService.getBySprintHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getSummaryHandler = useCallback(async (sprintId: string): Promise<TimeLogsSummaryInterface | null> => {
        setIsLoading(true);
        try {
            const res = await timeLogsService.getSummaryHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, timeLogsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getByTaskHandler, getBySprintHandler, getSummaryHandler, isLoading };
};