import { useCallback, useState } from "react";

import { timeLogsConstants } from "@/constants/time-logs";
import type { TimeLogInterface, TimeLogsSummaryInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { timeLogsService } from "@/services";

export const useGetTimeLog = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getByTaskHandler = useCallback(async (taskId: string): Promise<TimeLogInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await runAction(() => timeLogsService.getByTaskHandler(taskId), {
                errorFallback: timeLogsConstants.errors.fetchFailed,
                context: "time-logs.by-task",
            });
            return res?.data ?? null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getBySprintHandler = useCallback(async (sprintId: string): Promise<TimeLogInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await runAction(() => timeLogsService.getBySprintHandler(sprintId), {
                errorFallback: timeLogsConstants.errors.fetchFailed,
                context: "time-logs.by-sprint",
            });
            return res?.data ?? null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getSummaryHandler = useCallback(async (sprintId: string): Promise<TimeLogsSummaryInterface | null> => {
        setIsLoading(true);
        try {
            const res = await runAction(() => timeLogsService.getSummaryHandler(sprintId), {
                silent: true,
                context: "time-logs.summary",
            });
            return res?.data ?? null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getByTaskHandler, getBySprintHandler, getSummaryHandler, isLoading };
};
