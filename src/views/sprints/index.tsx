import { useState } from "react";
import { Calendar, Edit, MoreHorizontal, Plus, Trash2, Zap } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { t, useActivateSprint, useCreateSprint, useDeleteSprint, useSprintsList, useUpdateSprint } from "@/hooks";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";

const emptyForm: CreateSprintPayloadInterface = { name: "", start_date: "", end_date: "" };

const statusVariant = (status: string | null) => {
    if (status === "active") return "success";
    if (status === "completed") return "secondary";
    return "warning";
};

export const SprintsView = () => {
    const { sprints, isLoading, patchSprintLocal, removeSprintLocal } = useSprintsList();
    const { createHandler, isLoading: isCreating } = useCreateSprint();
    const { updateHandler, isLoading: isUpdating } = useUpdateSprint();
    const { deleteHandler } = useDeleteSprint();
    const { activateHandler, isLoading: isActivating } = useActivateSprint();

    const isSubmitting = isCreating || isUpdating;

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SprintInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SprintInterface | null>(null);
    const [form, setForm] = useState<CreateSprintPayloadInterface>(emptyForm);

    const openAdd = () => { setForm(emptyForm); setAddOpen(true); };
    const openEdit = (s: SprintInterface) => {
        setForm({ name: s.name, start_date: s.start_date, end_date: s.end_date });
        setEditTarget(s);
    };
    const closeDialogs = () => { setAddOpen(false); setEditTarget(null); setDeleteTarget(null); setForm(emptyForm); };

    const handleCreate = async () => {
        if (!form.name.trim() || !form.start_date || !form.end_date) return;
        const res = await createHandler(form);
        if (res) { patchSprintLocal(res); closeDialogs(); }
    };

    const handleUpdate = async () => {
        if (!editTarget || !form.name.trim()) return;
        const res = await updateHandler(editTarget.id, form);
        if (res) { patchSprintLocal(res); closeDialogs(); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeSprintLocal(deleteTarget.id); closeDialogs(); }
    };

    const handleActivate = async (s: SprintInterface) => {
        const res = await activateHandler(s.id);
        if (res) patchSprintLocal(res);
    };

    return (
        <div>
            <Header
                title={t("Sprints")}
                description={t("Manage project sprints.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={openAdd}>
                        <Plus className="h-4 w-4" />{t("New Sprint")}
                    </Button>
                }
            />

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
                </div>
            ) : sprints.length === 0 ? (
                <EmptyState icon={Calendar} title={t("No sprints yet")} description={t("Create your first sprint to get started.")} />
            ) : (
                <div className="flex flex-col gap-3">
                    {sprints.map((s) => (
                        <Card key={s.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-base font-semibold text-text-dark truncate">{s.name}</h3>
                                                <Badge variant={statusVariant(s.status)}>
                                                    {s.status ?? t("planned")}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {s.start_date} → {s.end_date}
                                            </p>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {s.status !== "active" && (
                                                <DropdownMenuItem onClick={() => handleActivate(s)} disabled={isActivating}>
                                                    <Zap className="h-4 w-4 mr-2 text-success" />{t("Activate")}
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => openEdit(s)}>
                                                <Edit className="h-4 w-4 mr-2" />{t("Edit")}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="text-error">
                                                <Trash2 className="h-4 w-4 mr-2" />{t("Delete")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add dialog */}
            <Dialog open={addOpen} onOpenChange={(open) => !open && closeDialogs()}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>{t("New Sprint")}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>{t("Name")} <span className="text-error">*</span></Label>
                            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("Sprint 15")} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>{t("Start Date")} <span className="text-error">*</span></Label>
                                <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("End Date")} <span className="text-error">*</span></Label>
                                <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button></DialogClose>
                        <Button onClick={handleCreate} disabled={isSubmitting || !form.name.trim() || !form.start_date || !form.end_date}>
                            {isCreating ? t("Creating...") : t("Create Sprint")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && closeDialogs()}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>{t("Edit Sprint")}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>{t("Name")} <span className="text-error">*</span></Label>
                            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>{t("Start Date")}</Label>
                                <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("End Date")}</Label>
                                <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button></DialogClose>
                        <Button onClick={handleUpdate} disabled={isSubmitting || !form.name.trim()}>
                            {isUpdating ? t("Saving...") : t("Save Changes")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && closeDialogs()}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{t("Delete Sprint")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-muted mt-2">
                        {t("Are you sure you want to delete")} <span className="font-semibold text-text-dark">{deleteTarget?.name}</span>?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
