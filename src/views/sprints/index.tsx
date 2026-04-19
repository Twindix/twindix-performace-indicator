import { useState } from "react";
import { Calendar, CheckCircle2, Edit, MoreHorizontal, Plus, Target, Trash2, Zap } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { useSprints } from "@/contexts";
import { SprintStatus } from "@/enums";
import { t } from "@/hooks";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

const emptyForm: CreateSprintPayloadInterface & { status?: SprintStatus; goalsRaw: string } = {
    name: "",
    startDate: "",
    endDate: "",
    goals: [],
    status: SprintStatus.Planned,
    goalsRaw: "",
};

export const SprintsView = () => {
    const { sprints, isLoading, createSprint, updateSprint, deleteSprint, activateSprint } = useSprints();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SprintInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SprintInterface | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openAdd = () => {
        setForm(emptyForm);
        setAddOpen(true);
    };

    const openEdit = (s: SprintInterface) => {
        setForm({
            name: s.name,
            startDate: s.startDate,
            endDate: s.endDate,
            goals: s.goals,
            status: s.status,
            goalsRaw: (s.goals ?? []).join("\n"),
        });
        setEditTarget(s);
    };

    const closeDialogs = () => {
        setAddOpen(false);
        setEditTarget(null);
        setForm(emptyForm);
    };

    const parseGoals = (raw: string): string[] =>
        raw.split("\n").map((g) => g.trim()).filter(Boolean);

    const handleSubmitAdd = async () => {
        if (!form.name.trim() || !form.startDate || !form.endDate) return;
        setIsSubmitting(true);
        const created = await createSprint({
            name: form.name.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            goals: parseGoals(form.goalsRaw),
        });
        setIsSubmitting(false);
        if (created) closeDialogs();
    };

    const handleSubmitEdit = async () => {
        if (!editTarget) return;
        if (!form.name.trim() || !form.startDate || !form.endDate) return;
        setIsSubmitting(true);
        const updated = await updateSprint(editTarget.id, {
            name: form.name.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            goals: parseGoals(form.goalsRaw),
            status: form.status,
        });
        setIsSubmitting(false);
        if (updated) closeDialogs();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteSprint(deleteTarget.id);
        if (ok) setDeleteTarget(null);
    };

    const handleActivate = async (s: SprintInterface) => {
        await activateSprint(s.id);
    };

    const statusBadge = (status: SprintStatus) => {
        if (status === SprintStatus.Active) return <Badge variant="success">{t("Active")}</Badge>;
        if (status === SprintStatus.Completed) return <Badge variant="outline">{t("Completed")}</Badge>;
        return <Badge variant="secondary">{t("Planned")}</Badge>;
    };

    return (
        <div>
            <Header
                title={t("Sprints")}
                description={t("Manage sprints, activate the current one, and set goals.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={openAdd}>
                        <Plus className="h-4 w-4" />
                        {t("Add Sprint")}
                    </Button>
                }
            />

            {sprints.length === 0 && !isLoading ? (
                <EmptyState
                    icon={Target}
                    title={t("No sprints yet")}
                    description={t("Create your first sprint to start planning work.")}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sprints.map((s) => (
                        <Card key={s.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-text-dark truncate">{s.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {statusBadge(s.status)}
                                            {typeof s.healthScore === "number" && (
                                                <span className="text-xs text-text-muted">
                                                    {t("Health")}: <strong className="text-text-dark">{s.healthScore}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-text-dark cursor-pointer">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {s.status !== SprintStatus.Active && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleActivate(s)} className="gap-2 cursor-pointer">
                                                        <Zap className="h-4 w-4" />
                                                        {t("Activate")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 cursor-pointer">
                                                <Edit className="h-4 w-4" />
                                                {t("Edit")}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="gap-2 text-error focus:text-error cursor-pointer">
                                                <Trash2 className="h-4 w-4" />
                                                {t("Delete")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{s.startDate} → {s.endDate}</span>
                                </div>

                                {s.goals?.length > 0 && (
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">{t("Goals")}</p>
                                        <ul className="space-y-1">
                                            {s.goals.slice(0, 3).map((g, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-xs text-text-dark">
                                                    <CheckCircle2 className="h-3 w-3 text-text-muted shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{g}</span>
                                                </li>
                                            ))}
                                            {s.goals.length > 3 && (
                                                <li className="text-[10px] text-text-muted">+ {s.goals.length - 3} {t("more")}</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add / Edit dialog */}
            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) closeDialogs(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Sprint") : t("Add Sprint")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("Name")} <span className="text-error">*</span></Label>
                            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("Sprint 12")} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">{t("Start Date")} <span className="text-error">*</span></Label>
                                <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">{t("End Date")} <span className="text-error">*</span></Label>
                                <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goals">{t("Goals")}</Label>
                            <Textarea id="goals" rows={4} placeholder={t("One goal per line")} value={form.goalsRaw} onChange={(e) => setForm({ ...form, goalsRaw: e.target.value })} />
                        </div>

                        {editTarget && (
                            <div className="space-y-2">
                                <Label>{t("Status")}</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SprintStatus })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={SprintStatus.Planned}>{t("Planned")}</SelectItem>
                                        <SelectItem value={SprintStatus.Active}>{t("Active")}</SelectItem>
                                        <SelectItem value={SprintStatus.Completed}>{t("Completed")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button
                            onClick={editTarget ? handleSubmitEdit : handleSubmitAdd}
                            disabled={isSubmitting || !form.name.trim() || !form.startDate || !form.endDate}
                        >
                            {isSubmitting ? t("Saving...") : editTarget ? t("Save Changes") : t("Create Sprint")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("Delete Sprint")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-secondary">
                        {t("Are you sure you want to delete")} <strong className="text-text-dark">{deleteTarget?.name}</strong>? {t("This action cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">{t("Cancel")}</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
