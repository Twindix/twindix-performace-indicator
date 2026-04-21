import { useState, useCallback, useRef } from "react";
import { Plus, X, Clock, User, AlertCircle, FileText, ListChecks, Tag, Paperclip, CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label, Textarea } from "@/atoms";
import { TaskPriority } from "@/enums";
import type { AddTaskDialogProps, AddTaskFormState } from "@/interfaces";
import { t, useCreateTask } from "@/hooks";
import { requirementsService, tasksService } from "@/services";
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

const PRIORITY_OPTIONS = [
    { value: TaskPriority.Low, label: "Low", color: "text-blue-500" },
    { value: TaskPriority.Medium, label: "Medium", color: "text-yellow-500" },
    { value: TaskPriority.High, label: "High", color: "text-orange-500" },
    { value: TaskPriority.Critical, label: "Critical", color: "text-red-500" },
];

const INITIAL_FORM_STATE: AddTaskFormState = {
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

export const AddTaskDialog = ({ open, onOpenChange, members, addTaskLocal }: AddTaskDialogProps) => {
    const { activeSprintId } = useSprintStore();
    const { createHandler: createTaskHandler, isLoading: isSubmitting } = useCreateTask();
    const [formState, setFormState] = useState<AddTaskFormState>(INITIAL_FORM_STATE);
    const [requirementInput, setRequirementInput] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskType, setTaskType] = useState<"stand_alone" | "compound">("stand_alone");
    const [compoundRule, setCompoundRule] = useState<"none" | "start_after_other" | "notify_on_done">("none");
    const requirementInputRef = useRef<HTMLInputElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submittingRef = useRef(false);

    const updateField = <K extends keyof AddTaskFormState>(field: K, value: AddTaskFormState[K]) =>
        setFormState((prev) => ({ ...prev, [field]: value }));

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            setFormState(INITIAL_FORM_STATE);
            setRequirementInput("");
            setTagInput("");
            setDeadline("");
            setTaskType("stand_alone");
            setCompoundRule("none");
        }
        onOpenChange(newOpen);
    }, [onOpenChange]);

    const addRequirement = useCallback(() => {
        const label = requirementInput.trim();
        if (!label) return;
        setFormState((prev) => ({
            ...prev,
            requirements: [
                ...prev.requirements,
                { id: `req-${Date.now()}`, label },
            ],
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

        if (!formState.title.trim()) { toast.error(t("Title is required")); return; }
        if (!formState.assigned_to) { toast.error(t("Assignee is required")); return; }
        if (!formState.estimatedHours || formState.estimatedHours <= 0) { toast.error(t("Estimated hours is required")); return; }
        if (!activeSprintId) return;

        submittingRef.current = true;
        const created = await createTaskHandler(activeSprintId, {
            title: formState.title.trim(),
            description: formState.description.trim() || undefined,
            assigned_to: formState.assigned_to,
            priority: formState.priority,
            estimated_hours: formState.estimatedHours,
        });

        if (created) {
            if (addTaskLocal) addTaskLocal(created);

            await Promise.all([
                ...formState.requirements.map((req) => requirementsService.createHandler(created.id, { content: req.label })),
                ...(formState.tags.length ? [tasksService.addTagsHandler(created.id, formState.tags)] : []),
                ...formState.files.map((file) => tasksService.addAttachmentHandler(created.id, file)),
            ]);

            handleOpenChange(false);
        }
        submittingRef.current = false;
    }, [formState, activeSprintId, createTaskHandler, handleOpenChange, addTaskLocal]);

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
                        />
                    </div>

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
                                        <button type="button" onClick={() => removeRequirement(req.id)} className="p-1 rounded-full hover:bg-surface text-text-muted hover:text-error transition-colors shrink-0">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-text-muted" />
                            {t("Tags")}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                ref={tagInputRef}
                                placeholder={t("Add a tag...")}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={addTag} className="gap-1.5 shrink-0">
                                <Plus className="h-4 w-4" />
                                {t("Add")}
                            </Button>
                        </div>
                        {formState.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {formState.tags.map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-error transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-text-muted" />
                            {t("Attachments")}
                        </Label>
                        <label className="flex items-center gap-2 w-fit text-xs text-primary font-medium cursor-pointer hover:underline">
                            <Paperclip className="h-4 w-4" />
                            {t("Choose files")}
                            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
                        </label>
                        {formState.files.length > 0 && (
                            <div className="flex flex-col gap-1.5 mt-1">
                                {formState.files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2">
                                        <Paperclip className="h-3.5 w-3.5 text-text-muted shrink-0" />
                                        <span className="flex-1 text-sm text-text-dark truncate">{file.name}</span>
                                        <span className="text-[10px] text-text-muted shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                                        <button type="button" onClick={() => removeFile(idx)} className="p-1 rounded-full hover:bg-surface text-text-muted hover:text-error transition-colors shrink-0">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignee" className="flex items-center gap-2">
                                <User className="h-4 w-4 text-text-muted" />
                                {t("Assigned To")} <span className="text-error">*</span>
                            </Label>
                            <Select value={formState.assigned_to} onValueChange={(v) => updateField("assigned_to", v)}>
                                <SelectTrigger id="assignee" className="w-full">
                                    <SelectValue placeholder={t("Select assignee")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium bg-muted rounded-full h-5 w-5 flex items-center justify-center">
                                                    {member.avatar_initials}
                                                </span>
                                                <span>{member.full_name}</span>
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
                                            <span className={option.color}>{t(option.label)}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedHours" className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-text-muted" />
                                {t("Estimated Hours")} <span className="text-error">*</span>
                            </Label>
                            <Input
                                id="estimatedHours"
                                type="number"
                                min={0.5}
                                step={0.5}
                                placeholder={t("Hours")}
                                value={formState.estimatedHours || ""}
                                onChange={(e) => updateField("estimatedHours", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deadline" className="flex items-center gap-2">
                                <CalendarClock className="h-4 w-4 text-text-muted" />
                                {t("Dead Time")}
                            </Label>
                            <Input
                                id="deadline"
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taskType" className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-text-muted" />
                                {t("Task Type")}
                            </Label>
                            <Select value={taskType} onValueChange={(v) => setTaskType(v as "stand_alone" | "compound")}>
                                <SelectTrigger id="taskType" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stand_alone">{t("Stand-alone")}</SelectItem>
                                    <SelectItem value="compound">{t("Compound")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {taskType === "compound" && (
                        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3">
                            <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                                <input
                                    type="radio"
                                    name="compoundRule"
                                    className="h-4 w-4 accent-primary cursor-pointer"
                                    checked={compoundRule === "start_after_other"}
                                    onChange={() => setCompoundRule("start_after_other")}
                                />
                                {t("Start only if other task done")}
                            </label>
                            <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                                <input
                                    type="radio"
                                    name="compoundRule"
                                    className="h-4 w-4 accent-primary cursor-pointer"
                                    checked={compoundRule === "notify_on_done"}
                                    onChange={() => setCompoundRule("notify_on_done")}
                                />
                                {t("Notify others when done")}
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
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
