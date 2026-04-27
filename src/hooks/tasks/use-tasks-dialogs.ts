import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import type {
    TaskInterface,
    UseTasksDialogsArgsInterface,
    UseTasksDialogsReturnInterface,
} from "@/interfaces";

export const useTasksDialogs = ({
    onTaskFetch,
    onPatchTask,
}: UseTasksDialogsArgsInterface): UseTasksDialogsReturnInterface => {
    const [selectedTask, setSelectedTask] = useState<TaskInterface | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [transitionOpen, setTransitionOpen] = useState(false);
    const [transitionTask, setTransitionTask] = useState<TaskInterface | null>(null);
    const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const queryTaskId = searchParams.get("taskId");

    useEffect(() => {
        if (!queryTaskId) return;
        onTaskFetch(queryTaskId).then((res) => {
            if (res) {
                setSelectedTask(res);
                setDetailOpen(true);
            }
            setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete("taskId"); return next; }, { replace: true });
        });
    }, [queryTaskId, onTaskFetch, setSearchParams]);

    useEffect(() => {
        if (!detailOpen || !selectedTask) return;
        onTaskFetch(selectedTask.id).then((res) => {
            if (res) {
                setSelectedTask(res);
                onPatchTask(res);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detailOpen, selectedTask?.id]);

    const openAdd = () => setAddOpen(true);
    const closeAdd = () => setAddOpen(false);

    const openTransition = useCallback((task: TaskInterface, targetPhase: string) => {
        setTransitionTask(task);
        setTransitionTarget(targetPhase);
        setTransitionOpen(true);
    }, []);

    const closeTransition = () => {
        setTransitionOpen(false);
        setTransitionTask(null);
        setTransitionTarget(null);
    };

    return {
        selectedTask,
        setSelectedTask,
        detailOpen,
        setDetailOpen,
        addOpen,
        openAdd,
        closeAdd,
        transition: {
            isOpen: transitionOpen,
            task: transitionTask,
            targetPhase: transitionTarget,
            open: openTransition,
            close: closeTransition,
        },
    };
};
