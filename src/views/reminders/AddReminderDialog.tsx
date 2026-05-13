import { useEffect, useState } from "react";
import { BellPlus, X } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { NOTIFY_PRESETS } from "@/enums";
import { t } from "@/hooks";
import type { ReminderInterface } from "@/interfaces";
import { useAuthStore, useRemindersStore } from "@/store";
import { cn } from "@/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: ReminderInterface | null;
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

export const AddReminderDialog = ({ open, onOpenChange, initial }: Props) => {
    const { user } = useAuthStore();
    const addReminder = useRemindersStore((s) => s.addReminder);
    const updateReminder = useRemindersStore((s) => s.updateReminder);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [intervals, setIntervals] = useState<number[]>([7, 1]);
    const [customInput, setCustomInput] = useState("");

    useEffect(() => {
        if (open) {
            setTitle(initial?.title ?? "");
            setDescription(initial?.description ?? "");
            setExpiresAt(initial?.expires_at ?? "");
            setIntervals(initial?.notify_before_days ?? [7, 1]);
            setCustomInput("");
        }
    }, [open, initial]);

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

    const handleSubmit = () => {
        if (!title.trim() || !expiresAt || intervals.length === 0 || !user) return;
        const payload = {
            title: title.trim(),
            description: description.trim() || undefined,
            expires_at: expiresAt,
            notify_before_days: intervals,
        };
        if (initial) {
            updateReminder(initial.id, payload);
        } else {
            addReminder(payload, {
                id: user.id,
                full_name: user.full_name,
                avatar_initials: user.avatar_initials,
            });
        }
        onOpenChange(false);
    };

    const todayISO = new Date().toISOString().split("T")[0];
    const canSubmit = title.trim() && expiresAt && intervals.length > 0;

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
                        <Label htmlFor="rem-title">{t("Title")} <span className="text-error">*</span></Label>
                        <Input id="rem-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("SSL certificate renewal")} />
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
                        <Input id="rem-expires" type="date" min={todayISO} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
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
                            {/* Custom intervals not in presets */}
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
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {initial ? t("Save Changes") : t("Create Reminder")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
