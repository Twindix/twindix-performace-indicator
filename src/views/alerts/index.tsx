import { useState } from "react";
import { Bell, Check, CheckCheck, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { t, useAcknowledgeAlert, useAlertsList, useCreateAlert, useDeleteAlert, useDoneAlert, useUpdateAlert } from "@/hooks";
import type { AlertInterface, CreateAlertPayloadInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/ui";
import { formatDateTime } from "@/utils";

const emptyForm: CreateAlertPayloadInterface = { title: "", body: "", target: "all" };

export const AlertsView = () => {
    const { activeSprintId } = useSprintStore();
    const { alerts, isLoading, patchAlertLocal, removeAlertLocal } = useAlertsList(activeSprintId);
    const { createHandler, isLoading: isCreating } = useCreateAlert();
    const { updateHandler, isLoading: isUpdating } = useUpdateAlert();
    const { deleteHandler } = useDeleteAlert();
    const { acknowledgeHandler } = useAcknowledgeAlert();
    const { doneHandler } = useDoneAlert();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AlertInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AlertInterface | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openEdit = (a: AlertInterface) => {
        setForm({ title: a.title, body: a.body, target: a.target });
        setEditTarget(a);
    };

    const handleAdd = async () => {
        if (!form.title.trim() || !activeSprintId) return;
        const res = await createHandler(activeSprintId, { ...form, title: form.title.trim(), body: form.body?.trim() || undefined });
        if (res) { patchAlertLocal(res); setAddOpen(false); setForm(emptyForm); }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateHandler(editTarget.id, { ...form, title: form.title.trim(), body: form.body?.trim() || undefined });
        if (res) { patchAlertLocal(res); setEditTarget(null); }
    };

    const handleAcknowledge = async (id: string) => {
        const res = await acknowledgeHandler(id);
        if (res) patchAlertLocal(res);
    };

    const handleDone = async (id: string) => {
        const res = await doneHandler(id);
        if (res) patchAlertLocal(res);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeAlertLocal(deleteTarget.id); setDeleteTarget(null); }
    };

    const pendingAlerts = alerts.filter((a) => a.status !== "done");
    const doneAlerts = alerts.filter((a) => a.status === "done");

    const renderCard = (alert: AlertInterface) => (
        <Card key={alert.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-dark">{alert.title}</h3>
                        {alert.body && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{alert.body}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(alert)} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer">
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(alert)} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px]">{alert.creator.avatar_initials}</AvatarFallback>
                        </Avatar>
                        <span>{alert.creator.full_name}</span>
                    </div>
                    {alert.mentioned_users.length > 0 && (
                        <span>{alert.mentioned_users.length} {t("mentioned")}</span>
                    )}
                    <Badge variant="outline" className="text-[10px]">{alert.target}</Badge>
                    <span className="ml-auto">{formatDateTime(alert.created_at)}</span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-text-muted">
                        {t("Acknowledged")}: {alert.acknowledgment_count}/{alert.total_targets}
                    </span>
                    <div className="flex gap-1.5 ml-auto">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAcknowledge(alert.id)}>
                            <Check className="h-3 w-3" /> {t("Acknowledge")}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDone(alert.id)}>
                            <CheckCheck className="h-3 w-3" /> {t("Done")}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div>
            <Header
                title={t("Alerts")}
                description={t("Create announcements and track acknowledgements.")}
                actions={
                    <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("Create Alert")}
                    </Button>
                }
            />

            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">{t("Pending")} ({pendingAlerts.length})</TabsTrigger>
                    <TabsTrigger value="done">{t("Done")} ({doneAlerts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    {isLoading ? null : pendingAlerts.length === 0 ? (
                        <EmptyState icon={Bell} title={t("No pending alerts")} description={t("All clear!")} />
                    ) : (
                        <div className="flex flex-col gap-3">{pendingAlerts.map(renderCard)}</div>
                    )}
                </TabsContent>

                <TabsContent value="done" className="mt-4">
                    {doneAlerts.length === 0 ? (
                        <EmptyState icon={CheckCheck} title={t("No done alerts")} description="" />
                    ) : (
                        <div className="flex flex-col gap-3">{doneAlerts.map(renderCard)}</div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) { setAddOpen(false); setEditTarget(null); setForm(emptyForm); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Alert") : t("Create Alert")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-3">
                        <div className="space-y-2">
                            <Label>{t("Title")} <span className="text-error">*</span></Label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("Alert title")} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Body")}</Label>
                            <Textarea rows={3} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Target")}</Label>
                            <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All")}</SelectItem>
                                    <SelectItem value="specific_users">{t("Specific Users")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={editTarget ? handleEdit : handleAdd} disabled={isCreating || isUpdating || !form.title.trim()}>
                            {(isCreating || isUpdating) ? t("Saving...") : editTarget ? t("Save") : t("Create")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{t("Delete Alert")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
