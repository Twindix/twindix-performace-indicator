import { useState, useCallback, useRef } from "react";
import { Plus, Paperclip, X, Clock, User, AlertCircle, FileText, MessageSquare, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { ValidationError } from "yup";

import { Button, Input, Label, Textarea } from "@/atoms";
import { TaskPriority, TaskStatus } from "@/enums";
import type { AddTaskDialogProps, AddTaskFormState } from "@/interfaces";
import { useTasks } from "@/contexts";
import { t, useCreateRequirement, useCreateTask } from "@/hooks";
import { useSprintStore } from "@/store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/ui";
import { cn } from "@/utils";
import { addTaskSchema } from "@/schemas/add-task.schema";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PRIORITY_OPTIONS = [
    { value: TaskPriority.Low, label: "Low", color: "text-blue-500" },
    { value: TaskPriority.Medium, label: "Medium", color: "text-yellow-500" },
    { value: TaskPriority.High, label: "High", color: "text-orange-500" },
    { value: TaskPriority.Critical, label: "Critical", color: "text-red-500" },
];

const STATUS_OPTIONS = [
    { value: TaskStatus.OnTrack, label: "On Track", color: "text-green-500" },
    { value: TaskStatus.AtRisk, label: "At Risk", color: "text-yellow-500" },
    { value: TaskStatus.Delayed, label: "Delayed", color: "text-orange-500" },
    { value: TaskStatus.OnHold, label: "On Hold", color: "text-gray-500" },
];

const INITIAL_FORM_STATE: AddTaskFormState = {
    title: "",
    description: "",
    assigneeIds: [],
    priority: TaskPriority.Medium,
    status: TaskStatus.OnTrack,
    estimatedHours: 0,
    attachments: [],
    initialComment: "",
    requirements: [],
};

/* -------------------------------------------------------------------------- */
/*  Add Task Dialog                                                            */
/* -------------------------------------------------------------------------- */

export const AddTaskDialog = ({ open, onOpenChange, members }: AddTaskDialogProps) => {
    const { activeSprintId } = useSprintStore();
    const { addTaskLocal, patchTaskLocal } = useTasks();
    const { createHandler: createTaskHandler, isLoading: isSubmitting } = useCreateTask();
    const { createHandler: createRequirementHandler } = useCreateRequirement();
    const [formState, setFormState] = useState<AddTaskFormState>(INITIAL_FORM_STATE);
    const [requirementInput, setRequirementInput] = useState("");
    const requirementInputRef = useRef<HTMLInputElement>(null);

    const updateField = <K extends keyof AddTaskFormState>(field: K, value: AddTaskFormState[K]) =>
        setFormState((prev) => ({ ...prev, [field]: value }));

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) { setFormState(INITIAL_FORM_STATE); setRequirementInput(""); }
        onOpenChange(newOpen);
    }, [onOpenChange]);

    const addRequirement = useCallback(() => {
        const label = requirementInput.trim();
        if (!label) return;
        setFormState((prev) => ({
            ...prev,
            requirements: [
                ...prev.requirements,
                { id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`, label },
            ],
        }));
        setRequirementInput("");
        requirementInputRef.current?.focus();
    }, [requirementInput]);

    const removeRequirement = useCallback((id: string) => {
        setFormState((prev) => ({ ...prev, requirements: prev.requirements.filter((r) => r.id !== id) }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newAttachments = Array.from(files).map((file) => ({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
        }));
        setFormState((prev) => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    }, []);

    const removeAttachment = useCallback((id: string) => {
        setFormState((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== id) }));
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addTaskSchema.validate(formState, { abortEarly: true });
        } catch (err) {
            if (err instanceof ValidationError) {
                toast.error(t(err.message));
                return;
            }
        }

        if (!activeSprintId) return;
        const created = await createTaskHandler(activeSprintId, {
            title: formState.title.trim(),
            description: formState.description.trim(),
            assigneeIds: formState.assigneeIds,
            priority: formState.priority,
            status: formState.status,
            tags: [],
        });
        if (created) {
            addTaskLocal(created);

            if (formState.requirements.length > 0) {
                const requirements = [];
                for (const req of formState.requirements) {
                    const reqRes = await createRequirementHandler(created.id, { label: req.label });
                    if (reqRes) requirements.push({ id: reqRes.id, label: reqRes.label, met: reqRes.met });
                }
                if (requirements.length > 0) patchTaskLocal(created.id, { requirements });
            }

            handleOpenChange(false);
        }
    }, [formState, activeSprintId, createTaskHandler, createRequirementHandler, addTaskLocal, patchTaskLocal, handleOpenChange]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Plus className="h-5 w-5 text-primary" />
                        <DialogTitle>{t("Add New Task")}</DialogTitle>
                    </div>
                    <DialogDescription>{t("Create a new task and assign it to a team member")}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-text-muted" />
                            {t("Title")} <span className="text-error">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder={t("Enter task title")}
                            value={formState.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-text-muted" />
                            {t("Description")}
                        </Label>
                        <Textarea
                            id="description"
                            placeholder={t("Enter task description...")}
                            value={formState.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-text-muted" />
                            {t("Requirements")}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                ref={requirementInputRef}
                                placeholder={t("Add a requirement...")}
                                value={requirementInput}
                                onChange={(e) => setRequirementInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={addRequirement} className="gap-1.5 shrink-0">
                                <Plus className="h-4 w-4" />
                                {t("Add")}
                            </Button>
                        </div>
                        {formState.requirements.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {formState.requirements.map((req) => (
                                    <div key={req.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2">
                                        <span className="flex-1 text-sm text-text-dark">{req.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeRequirement(req.id)}
                                            className="p-1 rounded-full hover:bg-surface text-text-muted hover:text-error transition-colors shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assignee, Priority and Status row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignee" className="flex items-center gap-2">
                                <User className="h-4 w-4 text-text-muted" />
                                {t("Assigned To")} <span className="text-error">*</span>
                            </Label>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {formState.assigneeIds.map((id) => {
                                        const member = members.find((m) => m.id === id);
                                        return member ? (
                                            <div
                                                key={id}
                                                className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm"
                                            >
                                                <span className="text-xs font-medium bg-primary rounded-full h-5 w-5 flex items-center justify-center text-primary-foreground">
                                                    {member.avatar_initials}
                                                </span>
                                                <span>{member.full_name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateField(
                                                            "assigneeIds",
                                                            formState.assigneeIds.filter((aid) => aid !== id)
                                                        )
                                                    }
                                                    className="ml-1 text-text-muted hover:text-error transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                                <Select
                                    value=""
                                    onValueChange={(v) => {
                                        if (!formState.assigneeIds.includes(v)) {
                                            updateField("assigneeIds", [...formState.assigneeIds, v]);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="assignee" className="w-full">
                                        <SelectValue placeholder={t("Add team member")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members
                                            .filter((m) => !formState.assigneeIds.includes(m.id))
                                            .map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium bg-muted rounded-full h-5 w-5 flex items-center justify-center">
                                                            {member.avatar_initials}
                                                        </span>
                                                        <span>{member.full_name}</span>
                                                        <span className="text-xs text-text-muted">({member.role_label ?? member.role_tier})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority" className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-text-muted" />
                                {t("Priority")}
                            </Label>
                            <Select value={formState.priority} onValueChange={(v) => updateField("priority", v as TaskPriority)}>
                                <SelectTrigger id="priority" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <span className={cn("font-medium", option.color)}>{t(option.label)}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-text-muted" />
                                {t("Status")}
                            </Label>
                            <Select value={formState.status} onValueChange={(v) => updateField("status", v as TaskStatus)}>
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <span className={cn("font-medium", option.color)}>{t(option.label)}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="space-y-2">
                        <Label htmlFor="estimatedHours" className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-text-muted" />
                            {t("Estimated Time")} <span className="text-error">*</span>
                            <span className="text-xs text-text-muted font-normal">({t("in hours")})</span>
                        </Label>
                        <Input
                            id="estimatedHours"
                            type="number"
                            min={0.5}
                            step={0.5}
                            placeholder={t("Enter estimated hours")}
                            value={formState.estimatedHours || ""}
                            onChange={(e) => updateField("estimatedHours", parseFloat(e.target.value) || 0)}
                            className="w-full sm:w-48"
                        />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                        <Label htmlFor="attachments" className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-text-muted" />
                            {t("Attachments")}
                        </Label>
                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    id="attachments"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark"
                                />
                            </div>
                            {formState.attachments.length > 0 && (
                                <div className="space-y-2">
                                    {formState.attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Paperclip className="h-4 w-4 text-text-muted shrink-0" />
                                                <span className="text-sm text-text-dark truncate">{attachment.name}</span>
                                                <span className="text-xs text-text-muted shrink-0">({formatFileSize(attachment.size)})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(attachment.id)}
                                                className="p-1 rounded-full hover:bg-surface text-text-muted hover:text-error transition-colors shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Initial Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="initialComment" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-text-muted" />
                            {t("Initial Comment")}
                        </Label>
                        <Textarea
                            id="initialComment"
                            placeholder={t("Add an initial comment or note...")}
                            value={formState.initialComment}
                            onChange={(e) => updateField("initialComment", e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {t("Cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? (
                                <>
                                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    {t("Creating...")}
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    {t("Create Task")}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
