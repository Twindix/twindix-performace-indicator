import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { CreateTaskPayloadInterface, TaskInterface, TasksContextInterface, UpdateTaskPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

const TasksContext = createContext<TasksContextInterface | null>(null);

export const TasksProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!sprintId) { setTasks([]); return; }
        setIsLoading(true);
        tasksService.listHandler(sprintId)
            .then((res) => setTasks(res.data))
            .catch((err) => toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed)))
            .finally(() => setIsLoading(false));
    }, [sprintId]);

    const createTask = useCallback(async (payload: CreateTaskPayloadInterface): Promise<TaskInterface | null> => {
        if (!sprintId) return null;
        try {
            const res = await tasksService.createHandler(sprintId, payload);
            setTasks((prev) => [...prev, res.data]);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.createFailed));
            return null;
        }
    }, [sprintId]);

    const updateTask = useCallback(async (id: string, payload: UpdateTaskPayloadInterface): Promise<TaskInterface | null> => {
        try {
            const res = await tasksService.updateHandler(id, payload);
            setTasks((prev) => prev.map((t) => t.id === id ? res.data : t));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.updateFailed));
            return null;
        }
    }, []);

    const fetchTaskDetail = useCallback(async (id: string): Promise<TaskInterface | null> => {
        try {
            const res = await tasksService.detailHandler(id);
            setTasks((prev) => prev.map((t) => t.id === id ? res.data : t));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
            return null;
        }
    }, []);

    const uploadAttachment = useCallback(async (taskId: string, file: File): Promise<TaskInterface | null> => {
        try {
            const res = await tasksService.addAttachmentHandler(taskId, file);
            setTasks((prev) => prev.map((t) => t.id === taskId ? res.data : t));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.attachmentUploadFailed));
            return null;
        }
    }, []);

    const removeAttachment = useCallback(async (taskId: string, attachmentId: string): Promise<void> => {
        try {
            await tasksService.removeAttachmentHandler(taskId, attachmentId);
            setTasks((prev) => prev.map((t) =>
                t.id === taskId
                    ? { ...t, attachments: (t.attachments ?? []).filter((a) => a.id !== attachmentId) }
                    : t,
            ));
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.attachmentDeleteFailed));
        }
    }, []);

    const patchTaskLocal = useCallback((id: string, updates: Partial<TaskInterface>) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const value = useMemo<TasksContextInterface>(() => ({
        tasks,
        isLoading,
        createTask,
        updateTask,
        fetchTaskDetail,
        uploadAttachment,
        removeAttachment,
        patchTaskLocal,
    }), [tasks, isLoading, createTask, updateTask, fetchTaskDetail, uploadAttachment, removeAttachment, patchTaskLocal]);

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextInterface => {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks must be used within TasksProvider");
    return ctx;
};
