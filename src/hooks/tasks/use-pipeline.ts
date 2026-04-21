import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { PipelineBoardInterface, TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const usePipeline = (sprintId: string) => {
    const [pipeline, setPipeline] = useState<PipelineBoardInterface>({});
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!sprintId) { setPipeline({}); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await tasksService.pipelineHandler(sprintId);
            setPipeline(res);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    useEffect(() => { refetch(); }, [refetch]);

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setPipeline((prev) => {
            const next: PipelineBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev)) {
                next[col] = tasks.map((t) => t.id === task.id ? task : t);
            }
            return next;
        });
    }, []);

    const removeTaskLocal = useCallback((id: string) => {
        setPipeline((prev) => {
            const next: PipelineBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev)) {
                next[col] = tasks.filter((t) => t.id !== id);
            }
            return next;
        });
    }, []);

    return { pipeline, isLoading, refetch, patchTaskLocal, removeTaskLocal };
};
