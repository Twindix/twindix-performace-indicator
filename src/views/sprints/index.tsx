import { useState } from "react";
import { Calendar, Edit, MoreHorizontal, Plus, Target, Trash2, Zap } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { SprintsSkeleton } from "@/components/skeletons";
import { t, useActivateSprint, useCreateSprint, useDeleteSprint, useFormErrors, useSprintsList, useUpdateSprint } from "@/hooks";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";

const emptyForm: CreateSprintPayloadInterface = { name: "", start_date: "", end_date: "" };

export const SprintsView = () => {
    const { sprints, isLoading, patchSprintLocal, removeSprintLocal } = useSprintsList();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isCreating } = useCreateSprint({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateSprint({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteSprint();
    const { activateHandler } = useActivateSprint();

    const isSubmitting = isCreating || isUpdating;

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SprintInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SprintInterface | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openAdd = () => { setForm(emptyForm); setAddOpen(true); };

    const openEdit = (s: SprintInterface) => {
        setForm({ name: s.name, start_date: s.start_date, end_date: s.end_date });
        setEditTarget(s);
    };

    const closeDialogs = () => { setAddOpen(false); setEditTarget(null); setForm(emptyForm); clearFieldErrors(); };

    const handleSubmitAdd = async () => {
        if (!form.name.trim() || !form.start_date || !form.end_date) return;
        const created = await createHandler({ name: form.name.trim(), start_date: form.start_date, end_date: form.end_date });
        if (created) { patchSprintLocal(created); closeDialogs(); }
    };

    const handleSubmitEdit = async () => {
        if (!editTarget || !form.name.trim() || !form.start_date || !form.end_date) return;
        const updated = await updateHandler(editTarget.id, { name: form.name.trim(), start_date: form.start_date, end_date: form.end_date });
        if (updated) { patchSprintLocal(updated); closeDialogs(); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        const ok = await deleteHandler(target.id);
        if (ok) removeSprintLocal(target.id);
    };

    const handleActivate = async (s: SprintInterface) => {
        const updated = await activateHandler(s.id);
        if (updated) patchSprintLocal(updated);
    };

    const statusBadge = (status: string | null) => {
        if (status === "active") return <Badge variant="success">{t("Active")}</Badge>;
        if (status === "completed") return <Badge variant="outline">{t("Completed")}</Badge>;
        return <Badge variant="secondary">{t("Planned")}</Badge>;
    };

    return (
        <div>
            <Header
                title={t("Sprints")}
                description={t("Manage sprints and activate the current one.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={openAdd}>
                        <Plus className="h-4 w-4" />
                        {t("Add Sprint")}
                    </Button>
                }
            />

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<SprintsSkeleton />}
                empty={sprints.length === 0}
                emptyState={<EmptyState icon={Target} title={t("No sprints yet")} description={t("Create your first sprint to start planning work.")} />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sprints.map((s) => (
                        <Card key={s.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-text-dark truncate">{s.name}</h3>
                                        <div className="mt-1">{statusBadge(s.status)}</div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-text-dark cursor-pointer">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {s.status !== "active" && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleActivate(s)} className="gap-2 cursor-pointer">
                                                        <Zap className="h-4 w-4" />{t("Activate")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 cursor-pointer">
                                                <Edit className="h-4 w-4" />{t("Edit")}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="gap-2 text-error focus:text-error cursor-pointer">
                                                <Trash2 className="h-4 w-4" />{t("Delete")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{s.start_date} → {s.end_date}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </QueryBoundary>

            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) closeDialogs(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Sprint") : t("Add Sprint")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("Name")} <span className="text-error">*</span></Label>
                            <Input id="name" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); clearError("name"); }} placeholder={t("Sprint 12")} />
                            {getError("name") && <p className="text-xs text-error">{getError("name")}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">{t("Start Date")} <span className="text-error">*</span></Label>
                                <Input id="start_date" type="date" value={form.start_date} onChange={(e) => { setForm({ ...form, start_date: e.target.value }); clearError("start_date"); }} />
                                {getError("start_date") && <p className="text-xs text-error">{getError("start_date")}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">{t("End Date")} <span className="text-error">*</span></Label>
                                <Input id="end_date" type="date" value={form.end_date} onChange={(e) => { setForm({ ...form, end_date: e.target.value }); clearError("end_date"); }} />
                                {getError("end_date") && <p className="text-xs text-error">{getError("end_date")}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button onClick={editTarget ? handleSubmitEdit : handleSubmitAdd} loading={isSubmitting} disabled={!form.name.trim() || !form.start_date || !form.end_date}>
                            {editTarget ? t("Save Changes") : t("Create Sprint")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{t("Delete Sprint")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary">
                        {t("Are you sure you want to delete")} <strong className="text-text-dark">{deleteTarget?.name}</strong>? {t("This action cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline" disabled={isDeleting}>{t("Cancel")}</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
