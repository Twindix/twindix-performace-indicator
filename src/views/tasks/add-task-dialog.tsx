import { useState, useCallback } from "react";
import { Plus, Paperclip, X, Clock, User, AlertCircle, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ValidationError } from "yup";

import { Button, Input, Label, Textarea } from "@/atoms";
import { TaskPriority, TaskPhase } from "@/enums";
import type { TaskInterface } from "@/interfaces";
import type { AddTaskDialogProps, AddTaskFormState } from "@/interfaces";
import { t } from "@/hooks";
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

const INITIAL_FORM_STATE: AddTaskFormState = {
    title: "",
    description: "",
    assigneeId: "",
    priority: TaskPriority.Medium,
    estimatedHours: 0,
    attachments: [],
    initialComment: "",
};

/* -------------------------------------------------------------------------- */
/*  Add Task Dialog                                                            */
/* -------------------------------------------------------------------------- */

export const AddTaskDialog = ({ open, onOpenChange, members, sprintId, onAddTask }: AddTaskDialogProps) => {
    const [formState, setFormState] = useState<AddTaskFormState>(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = <K extends keyof AddTaskFormState>(field: K, value: AddTaskFormState[K]) =>
        setFormState((prev) => ({ ...prev, [field]: value }));

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) setFormState(INITIAL_FORM_STATE);
        onOpenChange(newOpen);
    }, [onOpenChange]);

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

    const generateTaskId = () => `tsk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

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

        setIsSubmitting(true);

        try {
            const now = new Date().toISOString().split("T")[0];
            const newTask: TaskInterface = {
                id: generateTaskId(),
                title: formState.title.trim(),
                description: formState.description.trim(),
                assigneeId: formState.assigneeId,
                phase: TaskPhase.Backlog,
                priority: formState.priority,
                storyPoints: Math.ceil(formState.estimatedHours / 4),
                sprintId,
                readinessScore: 0,
                readinessChecklist: {
                    acceptanceCriteriaDefined: false,
                    businessRulesClear: false,
                    edgeCasesIdentified: false,
                    dependenciesMapped: false,
                    designAvailable: false,
                    apiContractReady: false,
                    estimationDone: true,
                },
                hasBlocker: false,
                createdAt: now,
                updatedAt: now,
                tags: [],
            };

            onAddTask(newTask);
            toast.success(t("Task created successfully"));
            handleOpenChange(false);
        } catch (error) {
            toast.error(t("Failed to create task"));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, sprintId, onAddTask, handleOpenChange]);

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

                    {/* Assignee and Priority row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignee" className="flex items-center gap-2">
                                <User className="h-4 w-4 text-text-muted" />
                                {t("Assigned To")} <span className="text-error">*</span>
                            </Label>
                            <Select value={formState.assigneeId} onValueChange={(v) => updateField("assigneeId", v)}>
                                <SelectTrigger id="assignee" className="w-full">
                                    <SelectValue placeholder={t("Select team member")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium bg-muted rounded-full h-5 w-5 flex items-center justify-center">
                                                    {member.avatar}
                                                </span>
                                                <span>{member.name}</span>
                                                <span className="text-xs text-text-muted">({member.role})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
