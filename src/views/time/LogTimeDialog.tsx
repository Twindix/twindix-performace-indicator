import { useEffect, useMemo, useState } from "react";

import { Button, DatePicker, Input, Label, Textarea } from "@/atoms";
import { t, useCreateStandaloneTimeLog, useFormErrors, useProjectsListLite } from "@/hooks";
import { useProjectSprints } from "@/hooks/projects/use-project-sprints";
import { tasksService } from "@/services";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

interface LogTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: string | null;
    onLogged?: () => void;
}

interface FormState {
    date: string;
    hours: number;
    user_id: string;
    sprint_id: string;
    task_id: string;
    note: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

interface TaskAutocompleteProps {
    tasks: { id: string; title: string; code?: string | null }[];
    value: string;
    onChange: (id: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const TaskAutocomplete = ({ tasks, value, onChange, disabled, placeholder }: TaskAutocompleteProps) => {
    const [query, setQuery] = useState("");
    const [dropOpen, setDropOpen] = useState(false);
    const selected = tasks.find((task) => task.id === value) ?? null;
    const displayLabel = selected ? (selected.code ? `${selected.code} - ${selected.title}` : selected.title) : query;
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tasks.filter((task) => !q || task.title.toLowerCase().includes(q) || (task.code ?? "").toLowerCase().includes(q)).slice(0, 10);
    }, [tasks, query]);

    return (
        <div className="relative">
            <Input
                placeholder={placeholder ?? t("Search tasks...")}
                value={displayLabel}
                disabled={disabled}
                onChange={(e) => { setQuery(e.target.value); if (selected) onChange(""); setDropOpen(true); }}
                onFocus={() => setDropOpen(true)}
                onBlur={() => setTimeout(() => setDropOpen(false), 120)}
            />
            {dropOpen && !disabled && filtered.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filtered.map((task) => (
                        <button
                            key={task.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { onChange(task.id); setQuery(""); setDropOpen(false); }}
                            className={`w-full px-3 py-2 text-start text-sm hover:bg-muted cursor-pointer ${task.id === value ? "bg-muted" : ""}`}
                        >
                            {task.code ? `${task.code} - ${task.title}` : task.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const LogTimeDialog = ({ open, onOpenChange, currentUserId, onLogged }: LogTimeDialogProps) => {
    const { projects } = useProjectsListLite();
    const { setFieldErrors, clearError, getError, clear: clearFieldErrors } = useFormErrors();
    const { createHandler, isLoading } = useCreateStandaloneTimeLog({ onFieldErrors: setFieldErrors });

    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [form, setForm] = useState<FormState>({
        date: todayIso(),
        hours: 1,
        user_id: currentUserId ?? "",
        sprint_id: "",
        task_id: "",
        note: "",
    });
    const [tasks, setTasks] = useState<{ id: string; title: string; code?: string | null }[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const { sprints } = useProjectSprints(selectedProjectId || null);

    useEffect(() => {
        if (open) {
            setSelectedProjectId("");
            setForm({ date: todayIso(), hours: 1, user_id: currentUserId ?? "", sprint_id: "", task_id: "", note: "" });
            setTasks([]);
        }
    }, [open, currentUserId]);

    useEffect(() => {
        if (!selectedProjectId) { setTasks([]); return; }
        let cancelled = false;
        setTasksLoading(true);
        tasksService.listLiteHandler({
            project_id: selectedProjectId,
            ...(form.sprint_id ? { sprint_id: form.sprint_id } : {}),
            exclude_done: true,
        })
            .then((result) => { if (!cancelled) setTasks(Array.isArray(result) ? result : []); })
            .catch(() => { if (!cancelled) setTasks([]); })
            .finally(() => { if (!cancelled) setTasksLoading(false); });
        return () => { cancelled = true; };
    }, [selectedProjectId, form.sprint_id]);

    const canSubmit = !!form.date && form.hours >= 0.25 && form.hours <= 24 && !!form.user_id && !!selectedProjectId;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        clearFieldErrors();
        const result = await createHandler({
            date: form.date,
            hours: form.hours,
            user_id: form.user_id,
            project_id: selectedProjectId,
            sprint_id: form.sprint_id || undefined,
            task_id: form.task_id || undefined,
            note: form.note || undefined,
        });
        if (result) {
            onLogged?.();
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        clearFieldErrors();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleCancel())}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("Log Time")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="tl-date">{t("Date")}</Label>
                            <DatePicker
                                id="tl-date"
                                value={form.date}
                                onChange={(v) => { setForm({ ...form, date: v }); clearError("date"); }}
                            />
                            {getError("date") && <p className="text-[11px] text-error">{getError("date")}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tl-hours">{t("Hours")}</Label>
                            <Input
                                id="tl-hours"
                                type="number"
                                min={0.25}
                                max={24}
                                step={0.25}
                                value={form.hours}
                                onChange={(e) => { setForm({ ...form, hours: Number(e.target.value) || 0 }); clearError("hours"); }}
                            />
                            {getError("hours") && <p className="text-[11px] text-error">{getError("hours")}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Project")}</Label>
                        <Select
                            value={selectedProjectId}
                            onValueChange={(value) => {
                                setSelectedProjectId(value);
                                setForm((prev) => ({ ...prev, sprint_id: "", task_id: "" }));
                                clearError("project_id");
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder={t("Select project")} /></SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {getError("project_id") && <p className="text-[11px] text-error">{getError("project_id")}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Sprint")} <span className="text-text-muted">({t("optional")})</span></Label>
                        <Select
                            value={form.sprint_id}
                            onValueChange={(value) => {
                                setForm((prev) => ({ ...prev, sprint_id: value, task_id: "" }));
                                clearError("sprint_id");
                            }}
                            disabled={!selectedProjectId || sprints.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={!selectedProjectId ? t("Select project first") : t("Optional")} />
                            </SelectTrigger>
                            <SelectContent>
                                {sprints.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Task")} <span className="text-text-muted">({t("optional")})</span></Label>
                        <TaskAutocomplete
                            tasks={tasks}
                            value={form.task_id}
                            onChange={(id) => { setForm((prev) => ({ ...prev, task_id: id })); clearError("task_id"); }}
                            disabled={!selectedProjectId || tasksLoading}
                            placeholder={
                                !selectedProjectId
                                    ? t("Select project first")
                                    : tasksLoading
                                        ? t("Loading tasks...")
                                        : tasks.length === 0
                                            ? t("No tasks available")
                                            : t("Search by task name...")
                            }
                        />
                        {getError("task_id") && <p className="text-[11px] text-error">{getError("task_id")}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tl-note">{t("Note")}</Label>
                        <Textarea
                            id="tl-note"
                            rows={3}
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            placeholder={t("What did you work on?")}
                        />
                        {getError("note") && <p className="text-[11px] text-error">{getError("note")}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                        {isLoading ? t("Logging...") : t("Log Time")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
