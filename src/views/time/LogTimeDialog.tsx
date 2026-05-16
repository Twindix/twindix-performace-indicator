import { useEffect, useState } from "react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { t, useCreateStandaloneTimeLog, useFormErrors, useProjectsListLite, useSprintsList } from "@/hooks";
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
    project_id: string;
    sprint_id: string;
    note: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyForm = (userId: string | null): FormState => ({
    date: todayIso(),
    hours: 1,
    user_id: userId ?? "",
    project_id: "",
    sprint_id: "",
    note: "",
});

export const LogTimeDialog = ({ open, onOpenChange, currentUserId, onLogged }: LogTimeDialogProps) => {
    const { projects } = useProjectsListLite();
    const { sprints } = useSprintsList();
    const { setFieldErrors, clearError, getError, clear: clearFieldErrors } = useFormErrors();
    const { createHandler, isLoading } = useCreateStandaloneTimeLog({ onFieldErrors: setFieldErrors });

    const [form, setForm] = useState<FormState>(() => emptyForm(currentUserId));

    useEffect(() => {
        if (open) setForm(emptyForm(currentUserId));
    }, [open, currentUserId]);

    const canSubmit = !!form.date && form.hours >= 0.25 && form.hours <= 24 && !!form.user_id && !!form.project_id;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        clearFieldErrors();
        const result = await createHandler({
            date: form.date,
            hours: form.hours,
            user_id: form.user_id,
            project_id: form.project_id,
            sprint_id: form.sprint_id || undefined,
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
                            <Input
                                id="tl-date"
                                type="date"
                                value={form.date}
                                onChange={(e) => { setForm({ ...form, date: e.target.value }); clearError("date"); }}
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
                            value={form.project_id}
                            onValueChange={(value) => { setForm({ ...form, project_id: value, sprint_id: "" }); clearError("project_id"); }}
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
                            onValueChange={(value) => setForm({ ...form, sprint_id: value })}
                            disabled={sprints.length === 0}
                        >
                            <SelectTrigger><SelectValue placeholder={t("Optional")} /></SelectTrigger>
                            <SelectContent>
                                {sprints.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
