import { useEffect, useState } from "react";

import {
    useDeleteTask,
    useGetRequirement,
    useMarkTaskComplete,
} from "@/hooks";
import type {
    UseTaskDetailArgsInterface,
    UseTaskDetailReturnInterface,
} from "@/interfaces";

export const useTaskDetail = ({
    task,
    open,
    onOpenChange,
    patchTaskLocal,
    removeTaskLocal,
}: UseTaskDetailArgsInterface): UseTaskDetailReturnInterface => {
    const { deleteHandler, isLoading: isDeletingTask } = useDeleteTask();
    const { markCompleteHandler, isLoading: isMarkingComplete } = useMarkTaskComplete();
    const { getAllHandler: getRequirementsHandler } = useGetRequirement();

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isFetchingRequirements, setIsFetchingRequirements] = useState(false);

    useEffect(() => {
        if (!open || !task) return;
        setIsFetchingRequirements(true);
        getRequirementsHandler(task.id).then((res) => {
            if (res) patchTaskLocal(task.id, { requirements: res });
            setIsFetchingRequirements(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, task?.id]);

    const handleDelete = async () => {
        if (!task) return;
        setConfirmDelete(false);
        const ok = await deleteHandler(task.id);
        if (ok) {
            removeTaskLocal(task.id);
            onOpenChange(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!task) return;
        const res = await markCompleteHandler(task.id);
        if (res) patchTaskLocal(task.id, { pending_approval: true });
    };

    return {
        confirmDelete,
        setConfirmDelete,
        isDeletingTask,
        isMarkingComplete,
        handleDelete,
        handleMarkComplete,
        isFetchingRequirements,
    };
};
