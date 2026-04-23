import { useState } from "react";
import { Edit, Flag, Plus, Trash2 } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { RedFlagsSkeleton } from "@/components/skeletons";
import { t, useCreateRedFlag, useDeleteRedFlag, usePermissions, useRedFlagsList, useUpdateRedFlag } from "@/hooks";
import type { RedFlagInterface, CreateRedFlagPayloadInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { formatDateTime } from "@/utils";

const emptyForm: CreateRedFlagPayloadInterface = { title: "", description: "", severity: "medium" };

const severityVariant: Record<string, "error" | "warning" | "secondary" | "outline"> = {
    critical: "error",
    high: "warning",
    medium: "secondary",

};

export const RedFlagsView = () => {
    const p = usePermissions();
    const { activeSprintId } = useSprintStore();
    const { redFlags, isLoading, patchRedFlagLocal, removeRedFlagLocal } = useRedFlagsList(activeSprintId);
    const { createHandler, isLoading: isCreating } = useCreateRedFlag();
    const { updateHandler, isLoading: isUpdating } = useUpdateRedFlag();
    const { deleteHandler, isLoading: isDeleting } = useDeleteRedFlag();

    const isSubmitting = isCreating || isUpdating;

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<RedFlagInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RedFlagInterface | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openEdit = (f: RedFlagInterface) => {
        setForm({ title: f.title, description: f.description, severity: f.severity });
        setEditTarget(f);
    };

    const closeDialogs = () => { setAddOpen(false); setEditTarget(null); setForm(emptyForm); };

    const handleAdd = async () => {
        if (!form.title.trim() || !activeSprintId) return;
        const res = await createHandler(activeSprintId, { ...form, title: form.title.trim(), description: form.description?.trim() || undefined });
        if (res) { patchRedFlagLocal(res); closeDialogs(); }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateHandler(editTarget.id, { ...form, title: form.title.trim(), description: form.description?.trim() || undefined });
        if (res) { patchRedFlagLocal(res); closeDialogs(); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeRedFlagLocal(deleteTarget.id); setDeleteTarget(null); }
    };

    return (
        <div>
            <Header
                title={t("Red Flags")}
                description={t("Track and manage sprint risk indicators.")}
                actions={
                    p.redFlags.create() ? (
                        <Button size="sm" className="gap-1.5" onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
                            <Plus className="h-4 w-4" />{t("Add Red Flag")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<RedFlagsSkeleton />}
                empty={redFlags.length === 0}
                emptyState={<EmptyState icon={Flag} title={t("No red flags")} description={t("No risks identified for this sprint.")} />}
            >
                <div className="flex flex-col gap-3">
                    {redFlags.map((f) => (
                        <Card key={f.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={severityVariant[f.severity] ?? "secondary"} className="capitalize text-[10px]">
                                                {f.severity}
                                            </Badge>
                                            {f.is_stalled && <Badge variant="warning" className="text-[10px]">{t("Stalled")}</Badge>}
                                        </div>
                                        <h3 className="text-sm font-semibold text-text-dark">{f.title}</h3>
                                        {f.description && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{f.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {p.redFlags.edit(f) && (
                                            <button onClick={() => openEdit(f)} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer">
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {p.redFlags.delete(f) && (
                                            <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[8px]">{f.reporter.avatar_initials}</AvatarFallback>
                                    </Avatar>
                                    <span>{f.reporter.full_name}</span>
                                    <span className="ml-auto">{formatDateTime(f.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </QueryBoundary>

            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) closeDialogs(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Red Flag") : t("Add Red Flag")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-3">
                        <div className="space-y-2">
                            <Label>{t("Title")} <span className="text-error">*</span></Label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("Describe the risk")} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Description")}</Label>
                            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Severity")}</Label>
                            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="medium">{t("Medium")}</SelectItem>
                                    <SelectItem value="high">{t("High")}</SelectItem>
                                    <SelectItem value="critical">{t("Critical")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button></DialogClose>
                        <Button onClick={editTarget ? handleEdit : handleAdd} loading={isSubmitting} disabled={!form.title.trim()}>
                            {editTarget ? t("Save Changes") : t("Create")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{t("Delete Red Flag")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
