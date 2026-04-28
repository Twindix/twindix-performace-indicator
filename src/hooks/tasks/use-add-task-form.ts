import { useCallback, useRef, useState } from "react";

import { TaskPriority } from "@/enums";
import { t, useCreateTask, useFormErrors } from "@/hooks";
import type {
    AddTaskCompoundStateInterface,
    AddTaskFormState,
    UseAddTaskFormArgsInterface,
    UseAddTaskFormReturnInterface,
} from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { requirementsService, tasksService } from "@/services";

const initialFormState: AddTaskFormState = {
    title: "",
    description: "",
    assigned_to: "",
    priority: TaskPriority.Medium,
    estimatedHours: 0,
    attachments: [],
    files: [],
    tags: [],
    requirements: [],
};

export const useAddTaskForm = ({
    sprintId,
    onClose,
    addTaskLocal,
}: UseAddTaskFormArgsInterface): UseAddTaskFormReturnInterface => {
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isSubmitting } = useCreateTask({ onFieldErrors: setFieldErrors });

    const [formState, setFormState] = useState<AddTaskFormState>(initialFormState);
    const [requirementInput, setRequirementInput] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskType, setTaskTypeRaw] = useState<"standalone" | "compound">("standalone");
    const [startAfterEnabled, setStartAfterEnabledRaw] = useState(false);
    const [startAfterTaskId, setStartAfterTaskId] = useState("");
    const [notifyEnabled, setNotifyEnabledRaw] = useState(false);
    const [notifyUserIds, setNotifyUserIds] = useState<string[]>([]);

    const requirementInputRef = useRef<HTMLInputElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const submittingRef = useRef(false);

    const updateField = <K extends keyof AddTaskFormState>(field: K, value: AddTaskFormState[K]) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
        clearError(field as string);
    };

    const setTaskType = (value: "standalone" | "compound") => {
        setTaskTypeRaw(value);
        if (value === "standalone") {
            setStartAfterEnabledRaw(false);
            setStartAfterTaskId("");
            setNotifyEnabledRaw(false);
            setNotifyUserIds([]);
        }
    };

    const setStartAfterEnabled = (value: boolean) => {
        setStartAfterEnabledRaw(value);
        if (!value) setStartAfterTaskId("");
    };

    const setNotifyEnabled = (value: boolean) => {
        setNotifyEnabledRaw(value);
        if (!value) setNotifyUserIds([]);
    };

    const resetForm = useCallback(() => {
        setFormState(initialFormState);
        setRequirementInput("");
        setTagInput("");
        setDeadline("");
        setTaskTypeRaw("standalone");
        setStartAfterEnabledRaw(false);
        setStartAfterTaskId("");
        setNotifyEnabledRaw(false);
        setNotifyUserIds([]);
        clearFieldErrors();
    }, [clearFieldErrors]);

    const addRequirement = useCallback(() => {
        const label = requirementInput.trim();
        if (!label) return;
        setFormState((prev) => ({
            ...prev,
            requirements: [...prev.requirements, { id: `req-${Date.now()}`, label }],
        }));
        setRequirementInput("");
        requirementInputRef.current?.focus();
    }, [requirementInput]);

    const removeRequirement = useCallback((id: string) => {
        setFormState((prev) => ({ ...prev, requirements: prev.requirements.filter((r) => r.id !== id) }));
    }, []);

    const addTag = useCallback(() => {
        const tag = tagInput.trim().replace(/^#/, "");
        if (!tag) return;
        setFormState((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
        }));
        setTagInput("");
        tagInputRef.current?.focus();
    }, [tagInput]);

    const removeTag = useCallback((tag: string) => {
        setFormState((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    }, []);

    const handleFileAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (!picked.length) return;
        setFormState((prev) => ({ ...prev, files: [...prev.files, ...picked] }));
    }, []);

    const removeFile = useCallback((idx: number) => {
        setFormState((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingRef.current) return;

        const clientErrors: Record<string, string[]> = {};
        if (!formState.title.trim()) clientErrors.title = [t("Title is required")];
        if (!formState.assigned_to) clientErrors.assigned_to = [t("Assignee is required")];
        if (!formState.estimatedHours || formState.estimatedHours <= 0) clientErrors.estimated_hours = [t("Estimated hours is required")];
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }
        if (!sprintId) return;

        submittingRef.current = true;
        const created = await createHandler(sprintId, {
            title: formState.title.trim(),
            description: formState.description.trim() || undefined,
            assigned_to: formState.assigned_to,
            priority: formState.priority,
            estimated_hours: formState.estimatedHours,
            dead_time: deadline || null,
            task_type: taskType,
            depends_on_task: taskType === "compound" && startAfterEnabled && startAfterTaskId ? startAfterTaskId : null,
            notify_on_done: taskType === "compound" && notifyEnabled,
        });

        if (created) {
            if (addTaskLocal) addTaskLocal(created);

            const hasExtras = formState.requirements.length > 0 || formState.tags.length > 0 || formState.files.length > 0;
            if (hasExtras) {
                await runAction(
                    () => Promise.all([
                        ...formState.requirements.map((req) => requirementsService.createHandler(created.id, { content: req.label })),
                        ...(formState.tags.length ? [tasksService.addTagsHandler(created.id, formState.tags)] : []),
                        ...formState.files.map((file) => tasksService.addAttachmentHandler(created.id, file)),
                    ]),
                    {
                        errorFallback: t("Task created, but some extras (requirements/tags/attachments) failed."),
                        context: "tasks.create-extras",
                    },
                );
            }

            onClose();
        }
        submittingRef.current = false;
    }, [formState, sprintId, createHandler, onClose, addTaskLocal, deadline, taskType, startAfterEnabled, startAfterTaskId, notifyEnabled, setFieldErrors]);

    const compound: AddTaskCompoundStateInterface = {
        taskType,
        startAfterEnabled,
        startAfterTaskId,
        notifyEnabled,
        notifyUserIds,
    };

    return {
        formState,
        updateField,
        requirementInput,
        setRequirementInput,
        addRequirement,
        removeRequirement,
        requirementInputRef,
        tagInput,
        setTagInput,
        addTag,
        removeTag,
        tagInputRef,
        handleFileAdd,
        removeFile,
        deadline,
        setDeadline,
        compound,
        setTaskType,
        setStartAfterEnabled,
        setStartAfterTaskId,
        setNotifyEnabled,
        setNotifyUserIds,
        isSubmitting,
        handleSubmit,
        getError,
        clearError,
        resetForm,
    };
};
