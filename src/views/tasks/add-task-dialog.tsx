import { useState, useCallback, useMemo, useRef } from "react";
import { Plus, X, Clock, User, AlertCircle, FileText, ListChecks, Tag, Paperclip, CalendarClock } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { TaskPriority } from "@/enums";
import type { AddTaskDialogProps, AddTaskFormState } from "@/interfaces";
import type { TaskInterface } from "@/interfaces";
import type { UserLiteInterface } from "@/interfaces";
import { t, useCreateTask, useFormErrors, useTasksListLite } from "@/hooks";
import { runAction } from "@/lib/handle-action";
import { requirementsService, tasksService } from "@/services";
import { useSprintStore } from "@/store";
import { Checkbox } from "@/ui";
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

interface TaskAutocompleteProps {
    tasks: Pick<TaskInterface, "id" | "title">[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
}

const TaskAutocomplete = ({ tasks, value, onChange, placeholder }: TaskAutocompleteProps) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const selected = tasks.find((task) => task.id === value) ?? null;
    const effectiveQuery = selected ? selected.title : query;
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tasks.filter((task) => !q || task.title.toLowerCase().includes(q)).slice(0, 8);
    }, [tasks, query]);

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <Input
                    placeholder={placeholder ?? t("Search tasks...")}
                    value={effectiveQuery}
                    onChange={(e) => { setQuery(e.target.value); if (selected) onChange(""); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                />
                {selected && (
                    <button type="button" onClick={() => { onChange(""); setQuery(""); }} className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-muted shrink-0">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {open && filtered.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filtered.map((task) => (
                        <button key={task.id} type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { onChange(task.id); setQuery(""); setOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer ${task.id === value ? "bg-muted" : ""}`}>
                            {task.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface UsersAutocompleteProps {
    members: UserLiteInterface[];
    values: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
}

const UsersAutocomplete = ({ members, values, onChange, placeholder }: UsersAutocompleteProps) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const selected = members.filter((m) => values.includes(m.id));
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return members.filter((m) =>
            !values.includes(m.id) && (!q || m.full_name.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q)),
        ).slice(0, 8);
    }, [members, values, query]);

    const addUser = (id: string) => { onChange([...values, id]); setQuery(""); };
    const removeUser = (id: string) => onChange(values.filter((v) => v !== id));

    return (
        <div className="flex flex-col gap-2">
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map((m) => (
                        <span key={m.id} className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full pl-2 pr-1 py-0.5">
                            {m.full_name}
                            <button type="button" onClick={() => removeUser(m.id)} className="hover:text-error transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="relative">
                <Input
                    placeholder={placeholder ?? t("Search users...")}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                />
                {open && filtered.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                        {filtered.map((m) => (
                            <button key={m.id} type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addUser(m.id)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer flex items-center gap-2">
                                <span className="text-xs font-medium bg-muted rounded-full h-5 w-5 flex items-center justify-center shrink-0">{m.avatar_initials}</span>
                                <span className="flex-1 truncate">{m.full_name}</span>
                                {m.email && <span className="text-xs text-text-muted truncate">{m.email}</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

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
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler: createTaskHandler, isLoading: isSubmitting } = useCreateTask({ onFieldErrors: setFieldErrors });
    const [formState, setFormState] = useState<AddTaskFormState>(INITIAL_FORM_STATE);
    const [requirementInput, setRequirementInput] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskType, setTaskType] = useState<"standalone" | "compound">("standalone");
    const [startAfterEnabled, setStartAfterEnabled] = useState(false);
    const [startAfterTaskId, setStartAfterTaskId] = useState("");
    const [notifyEnabled, setNotifyEnabled] = useState(false);
    const [notifyUserIds, setNotifyUserIds] = useState<string[]>([]);
    const { tasks: sprintTasks } = useTasksListLite({ sprint_id: activeSprintId ?? undefined, exclude_done: true });
    const requirementInputRef = useRef<HTMLInputElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submittingRef = useRef(false);

    const updateField = <K extends keyof AddTaskFormState>(field: K, value: AddTaskFormState[K]) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
        clearError(field);
    };

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            setFormState(INITIAL_FORM_STATE);
            setRequirementInput("");
            setTagInput("");
            setDeadline("");
            setTaskType("standalone");
            setStartAfterEnabled(false);
            setStartAfterTaskId("");
            setNotifyEnabled(false);
            setNotifyUserIds([]);
            clearFieldErrors();
        }
        onOpenChange(newOpen);
    }, [onOpenChange, clearFieldErrors]);

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

        const clientErrors: Record<string, string[]> = {};
        if (!formState.title.trim()) clientErrors.title = [t("Title is required")];
        if (!formState.assigned_to) clientErrors.assigned_to = [t("Assignee is required")];
        if (!formState.estimatedHours || formState.estimatedHours <= 0) clientErrors.estimated_hours = [t("Estimated hours is required")];
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }
        if (!activeSprintId) return;

        submittingRef.current = true;
        const created = await createTaskHandler(activeSprintId, {
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

            handleOpenChange(false);
        }
        submittingRef.current = false;
    }, [formState, activeSprintId, createTaskHandler, handleOpenChange, addTaskLocal, deadline, taskType, startAfterEnabled, startAfterTaskId, notifyEnabled, setFieldErrors]);

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
                        {getError("title") && <p className="text-xs text-error">{getError("title")}</p>}
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
                        {getError("description") && <p className="text-xs text-error">{getError("description")}</p>}
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
                            {getError("assigned_to") && <p className="text-xs text-error">{getError("assigned_to")}</p>}
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
                            {getError("priority") && <p className="text-xs text-error">{getError("priority")}</p>}
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
                            {getError("estimated_hours") && <p className="text-xs text-error">{getError("estimated_hours")}</p>}
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
                                onChange={(e) => { setDeadline(e.target.value); clearError("dead_time"); }}
                            />
                            {getError("dead_time") && <p className="text-xs text-error">{getError("dead_time")}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taskType" className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-text-muted" />
                                {t("Task Type")}
                            </Label>
                            <Select value={taskType} onValueChange={(v) => setTaskType(v as "standalone" | "compound")}>
                                <SelectTrigger id="taskType" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standalone">{t("Stand-alone")}</SelectItem>
                                    <SelectItem value="compound">{t("Compound")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {taskType === "compound" && (
                        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-3">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                                    <Checkbox
                                        checked={startAfterEnabled}
                                        onCheckedChange={(v) => {
                                            const enabled = v === true;
                                            setStartAfterEnabled(enabled);
                                            if (!enabled) setStartAfterTaskId("");
                                        }}
                                    />
                                    {t("Start only if other task done")}
                                </label>
                                {startAfterEnabled && (
                                    <TaskAutocomplete
                                        tasks={sprintTasks}
                                        value={startAfterTaskId}
                                        onChange={setStartAfterTaskId}
                                        placeholder={t("Search tasks in this sprint...")}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                                    <Checkbox
                                        checked={notifyEnabled}
                                        onCheckedChange={(v) => {
                                            const enabled = v === true;
                                            setNotifyEnabled(enabled);
                                            if (!enabled) setNotifyUserIds([]);
                                        }}
                                    />
                                    {t("Notify others when done")}
                                </label>
                                {notifyEnabled && (
                                    <UsersAutocomplete
                                        members={members}
                                        values={notifyUserIds}
                                        onChange={setNotifyUserIds}
                                        placeholder={t("Search users to notify...")}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                            {t("Cancel")}
                        </Button>
                        <Button type="submit" loading={isSubmitting} className="gap-2">
                            {!isSubmitting && <Plus className="h-4 w-4" />}
                            {t("Create Task")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
