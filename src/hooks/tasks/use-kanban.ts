import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { KanbanBoardInterface, TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useKanban = (sprintId: string) => {
    const [kanban, setKanban] = useState<KanbanBoardInterface>({});
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!sprintId) { setKanban({}); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await tasksService.kanbanHandler(sprintId);
            setKanban(res);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    useEffect(() => { refetch(); }, [refetch]);

    const patchTaskLocal = useCallback((task: TaskInterface) => {
        setKanban((prev) => {
            const next: KanbanBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev)) {
                next[col] = tasks.filter((t) => t.id !== task.id);
            }
            const targetCol = task.status ?? "backlog";
            next[targetCol] = [task, ...(next[targetCol] ?? [])];
            return next;
        });
    }, []);

    const removeTaskLocal = useCallback((id: string) => {
        setKanban((prev) => {
            const next: KanbanBoardInterface = {};
            for (const [col, tasks] of Object.entries(prev)) {
                next[col] = tasks.filter((t) => t.id !== id);
            }
            return next;
        });
    }, []);

    return { kanban, isLoading, refetch, patchTaskLocal, removeTaskLocal };
};
