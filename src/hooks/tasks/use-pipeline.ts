import { useCallback } from "react";

import { tasksConstants } from "@/constants";
import type { PipelineBoardInterface, TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useQueryAction } from "../shared";

export const usePipeline = (sprintId: string) => {
    const { data, isLoading, refetch, setData } = useQueryAction<PipelineBoardInterface>(
        async () => (sprintId ? await tasksService.pipelineHandler(sprintId) : {}),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: tasksConstants.errors.fetchFailed,
            initialData: {},
            context: "tasks.pipeline",
        },
    );

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setData((prev) => {
            const next: PipelineBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev ?? {})) {
                next[col] = tasks.map((t) => (t.id === task.id ? task : t));
            }
            return next;
        });
    }, [setData]);

    const removeTaskLocal = useCallback((id: string) => {
        setData((prev) => {
            const next: PipelineBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev ?? {})) {
                next[col] = tasks.filter((t) => t.id !== id);
            }
            return next;
        });
    }, [setData]);

    return { pipeline: data ?? {}, isLoading, refetch, patchTaskLocal, removeTaskLocal };
};
