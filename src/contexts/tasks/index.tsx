import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { TaskStatus } from "@/enums";
import type { CreateTaskPayloadInterface, TaskInterface, TaskStatsInterface, TasksContextInterface, UpdateTaskPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

const TasksContext = createContext<TasksContextInterface | null>(null);

export const TasksProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [kanban, setKanban] = useState<Record<string, TaskInterface[]>>({});
    const [pipeline, setPipeline] = useState<TaskInterface[]>([]);
    const [pipelineCounts, setPipelineCounts] = useState<Record<string, number>>({});
    const [stats, setStats] = useState<TaskStatsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!sprintId) { setTasks([]); return; }
        setIsLoading(true);
        tasksService.listHandler(sprintId)
            .then((res) => setTasks(res.data))
            .catch((err) => toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed)))
            .finally(() => setIsLoading(false));
    }, [sprintId]);

    const fetchKanban = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.kanbanHandler(sprintId);
            setKanban(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
    }, [sprintId]);

    const fetchPipeline = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.pipelineHandler(sprintId);
            setPipeline(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
    }, [sprintId]);

    const fetchPipelineCounts = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.pipelineCountsHandler(sprintId);
            setPipelineCounts(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
    }, [sprintId]);

    const fetchStats = useCallback(async (): Promise<void> => {
        if (!sprintId) return;
        try {
            const res = await tasksService.statsHandler(sprintId);
            setStats(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.fetchFailed));
        }
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

    const updateTaskStatus = useCallback(async (id: string, status: TaskStatus): Promise<TaskInterface | null> => {
        try {
            const res = await tasksService.updateStatusHandler(id, { status });
            setTasks((prev) => prev.map((t) => t.id === id ? res.data : t));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.statusUpdateFailed));
            return null;
        }
    }, []);

    const deleteTask = useCallback(async (id: string): Promise<boolean> => {
        try {
            await tasksService.deleteHandler(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.deleteFailed));
            return false;
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

    const fetchTransitionCriteria = useCallback(async (id: string): Promise<TaskInterface[] | null> => {
        try {
            const res = await tasksService.transitionCriteriaHandler(id);
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

    const addTags = useCallback(async (taskId: string, tagsToAdd: string[]): Promise<TaskInterface | null> => {
        try {
            const res = await tasksService.addTagsHandler(taskId, tagsToAdd);
            setTasks((prev) => prev.map((t) => t.id === taskId ? res.data : t));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.tagAddFailed));
            return null;
        }
    }, []);

    const removeTag = useCallback(async (taskId: string, tag: string): Promise<TaskInterface | null> => {
        try {
            const res = await tasksService.removeTagHandler(taskId, tag);
            setTasks((prev) => prev.map((t) => t.id === taskId ? res.data : t));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.tagRemoveFailed));
            return null;
        }
    }, []);

    const patchTaskLocal = useCallback((id: string, updates: Partial<TaskInterface>) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const value = useMemo<TasksContextInterface>(() => ({
        tasks,
        kanban,
        pipeline,
        pipelineCounts,
        stats,
        isLoading,
        fetchKanban,
        fetchPipeline,
        fetchPipelineCounts,
        fetchStats,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        fetchTaskDetail,
        fetchTransitionCriteria,
        uploadAttachment,
        removeAttachment,
        addTags,
        removeTag,
        patchTaskLocal,
    }), [tasks, kanban, pipeline, pipelineCounts, stats, isLoading, fetchKanban, fetchPipeline, fetchPipelineCounts, fetchStats, createTask, updateTask, updateTaskStatus, deleteTask, fetchTaskDetail, fetchTransitionCriteria, uploadAttachment, removeAttachment, addTags, removeTag, patchTaskLocal]);

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextInterface => {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks must be used within TasksProvider");
    return ctx;
};
