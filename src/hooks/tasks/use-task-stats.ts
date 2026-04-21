import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskStatsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskStats = () => {
    const [isLoading, setIsLoading] = useState(false);

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

    return { statsHandler, isLoading };
};
