import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useGetTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<TaskInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (sprintId: string): Promise<TaskInterface[] | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.listHandler(sprintId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, isLoading };
};
