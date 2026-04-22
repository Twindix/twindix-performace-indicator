import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useGetTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = useCallback(async (id: string): Promise<TaskInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.detailHandler(id);
            return (res as unknown as { data?: TaskInterface }).data ?? (res as unknown as TaskInterface);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getHandler, isLoading };
};