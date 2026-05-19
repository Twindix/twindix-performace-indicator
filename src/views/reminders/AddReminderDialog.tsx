import { useEffect, useState } from "react";
import { BellPlus, X } from "lucide-react";

import { Button, DatePicker, Input, Label, Textarea } from "@/atoms";
import { NOTIFY_PRESETS } from "@/enums";
import { t, useCreateReminder, useFormErrors, useProjectsListLite, useUpdateReminder } from "@/hooks";
import type { ReminderInterface } from "@/interfaces";
import { cn } from "@/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: ReminderInterface | null;
    onSaved?: (reminder: ReminderInterface) => void;
}

const labelFor = (days: number): string => {
    if (days === 1) return "1d";
    if (days < 7) return `${days}d`;
    if (days === 7) return "1w";
    if (days === 14) return "2w";
    if (days % 7 === 0 && days < 30) return `${days / 7}w`;
    if (days === 30) return "1m";
    return `${days}d`;
};

export const AddReminderDialog = ({ open, onOpenChange, initial, onSaved }: Props) => {
    const { setFieldErrors, getError, clear: clearFieldErrors } = useFormErrors();
    const { createHandler, isLoading: isCreating } = useCreateReminder({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateReminder({ onFieldErrors: setFieldErrors });
    const { projects } = useProjectsListLite();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [projectId, setProjectId] = useState(initial?.project_id ?? "");
    const [intervals, setIntervals] = useState<number[]>([7, 1]);
    const [customInput, setCustomInput] = useState("");

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            setTitle(initial?.title ?? "");
            setDescription(initial?.description ?? "");
            setExpiresAt(initial?.expires_at ?? "");
            setProjectId(initial?.project_id ?? "");
            setIntervals(initial?.notify_before_days ?? [7, 1]);
            setCustomInput("");
            clearFieldErrors();
        }
    }, [open, initial, clearFieldErrors]);

    const toggleInterval = (d: number) => {
        setIntervals((prev) => (prev.includes(d) ? prev.filter((n) => n !== d) : [...prev, d].sort((a, b) => b - a)));
    };

    const addCustom = () => {
        const n = parseInt(customInput.trim(), 10);
        if (!isNaN(n) && n > 0 && !intervals.includes(n)) {
            setIntervals([...intervals, n].sort((a, b) => b - a));
            setCustomInput("");
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !expiresAt || intervals.length === 0 || !projectId) return;
        const payload = {
            title: title.trim(),
            description: description.trim() || undefined,
            expires_at: expiresAt,
            notify_before_days: intervals,
            project_id: projectId,
        };
        const result = initial
            ? await updateHandler(initial.id, payload)
            : await createHandler(payload);
        if (result) {
            onSaved?.(result);
            onOpenChange(false);
        }
    };

    const todayISO = new Date().toISOString().split("T")[0];
    const canSubmit = title.trim() && expiresAt && intervals.length > 0 && !!projectId && !isLoading;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BellPlus className="h-5 w-5 text-primary" />
                        {initial ? t("Edit Reminder") : t("New Reminder")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("We'll notify you at each selected interval before the expiry date.")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>{t("Project")} <span className="text-error">*</span></Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger><SelectValue placeholder={t("Select project")} /></SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {getError("project_id") && <p className="text-[11px] text-error">{getError("project_id")}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rem-title">{t("Title")} <span className="text-error">*</span></Label>
                        <Input id="rem-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("SSL certificate renewal")} />
                        {getError("title") && <p className="text-[11px] text-error">{getError("title")}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rem-desc">{t("Description")}</Label>
                        <Textarea
                            id="rem-desc"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("Context, links, or any details you want surfaced when this fires.")}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rem-expires">{t("Expires on")} <span className="text-error">*</span></Label>
                        <DatePicker id="rem-expires" min={todayISO} value={expiresAt} onChange={setExpiresAt} />
                        {getError("expires_at") && <p className="text-[11px] text-error">{getError("expires_at")}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>{t("Notify me before")} <span className="text-error">*</span></Label>
                        <div className="flex flex-wrap gap-2">
                            {NOTIFY_PRESETS.map((d) => {
                                const active = intervals.includes(d);
                                return (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => toggleInterval(d)}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold tabular-nums transition-all",
                                            "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                            active
                                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                : "bg-card text-text-dark border-border hover:border-primary/40 hover:bg-primary/5",
                                        )}
                                    >
                                        {labelFor(d)}
                                    </button>
                                );
                            })}
                            {intervals.filter((d) => !NOTIFY_PRESETS.includes(d as typeof NOTIFY_PRESETS[number])).map((d) => (
                                <span
                                    key={d}
                                    className="inline-flex items-center gap-1.5 h-8 ps-3 pe-2 rounded-full text-xs font-semibold tabular-nums bg-primary text-primary-foreground border border-primary"
                                >
                                    {labelFor(d)}
                                    <button onClick={() => toggleInterval(d)} className="hover:bg-white/15 rounded-full p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="number"
                                min={1}
                                max={365}
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder={t("Custom days…")}
                                className="h-8 w-32 text-xs"
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                            />
                            <Button size="sm" variant="outline" onClick={addCustom} disabled={!customInput.trim()}>
                                {t("Add")}
                            </Button>
                            <p className="text-[11px] text-text-muted ms-auto tabular-nums">
                                {intervals.length} {intervals.length === 1 ? t("interval") : t("intervals")}
                            </p>
                        </div>
                        {getError("notify_before_days") && <p className="text-[11px] text-error">{getError("notify_before_days")}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {isLoading ? (initial ? t("Saving...") : t("Creating...")) : (initial ? t("Save Changes") : t("Create Reminder"))}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
