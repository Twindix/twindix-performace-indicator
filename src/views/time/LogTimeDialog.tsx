import { useMemo, useState } from "react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { t } from "@/hooks";
import type {
    CreateTimeEntryPayloadInterface,
    TimeMemberInterface,
    TimeProjectInterface,
    TimeSprintInterface,
    TimeTaskInterface,
} from "@/interfaces/time";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

interface LogTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: TimeMemberInterface[];
    projects: TimeProjectInterface[];
    sprints: TimeSprintInterface[];
    tasks: TimeTaskInterface[];
    onSubmit: (payload: CreateTimeEntryPayloadInterface) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): CreateTimeEntryPayloadInterface => ({
    date: todayIso(),
    member_id: "",
    project_id: "",
    sprint_id: null,
    task_id: null,
    hours: 1,
    note: "",
});

export const LogTimeDialog = ({ open, onOpenChange, members, projects, sprints, tasks, onSubmit }: LogTimeDialogProps) => {
    const [form, setForm] = useState<CreateTimeEntryPayloadInterface>(emptyForm);

    const sprintOptions = useMemo(
        () => (form.project_id ? sprints.filter((s) => s.project_id === form.project_id) : []),
        [sprints, form.project_id],
    );

    const taskOptions = useMemo(() => {
        if (!form.project_id) return [];
        return tasks.filter((task) => {
            if (task.project_id !== form.project_id) return false;
            if (form.sprint_id && task.sprint_id !== form.sprint_id) return false;
            return true;
        });
    }, [tasks, form.project_id, form.sprint_id]);

    const canSubmit = form.date && form.member_id && form.project_id && form.hours > 0;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit(form);
        setForm(emptyForm());
        onOpenChange(false);
    };

    const handleCancel = () => {
        setForm(emptyForm());
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
                            <Input
                                id="tl-date"
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tl-hours">{t("Hours")}</Label>
                            <Input
                                id="tl-hours"
                                type="number"
                                min={0}
                                step={0.25}
                                value={form.hours}
                                onChange={(e) => setForm({ ...form, hours: Number(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Member")}</Label>
                        <Select value={form.member_id} onValueChange={(value) => setForm({ ...form, member_id: value })}>
                            <SelectTrigger><SelectValue placeholder={t("Select member")} /></SelectTrigger>
                            <SelectContent>
                                {members.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Project")}</Label>
                        <Select
                            value={form.project_id}
                            onValueChange={(value) => setForm({ ...form, project_id: value, sprint_id: null, task_id: null })}
                        >
                            <SelectTrigger><SelectValue placeholder={t("Select project")} /></SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>{t("Sprint")}</Label>
                            <Select
                                value={form.sprint_id ?? ""}
                                onValueChange={(value) => setForm({ ...form, sprint_id: value || null, task_id: null })}
                                disabled={!form.project_id || sprintOptions.length === 0}
                            >
                                <SelectTrigger><SelectValue placeholder={t("Optional")} /></SelectTrigger>
                                <SelectContent>
                                    {sprintOptions.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("Task")}</Label>
                            <Select
                                value={form.task_id ?? ""}
                                onValueChange={(value) => setForm({ ...form, task_id: value || null })}
                                disabled={!form.project_id || taskOptions.length === 0}
                            >
                                <SelectTrigger><SelectValue placeholder={t("Optional")} /></SelectTrigger>
                                <SelectContent>
                                    {taskOptions.map((task) => (
                                        <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tl-note">{t("Note")}</Label>
                        <Textarea
                            id="tl-note"
                            rows={3}
                            value={form.note ?? ""}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            placeholder={t("What did you work on?")}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>{t("Log Time")}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
