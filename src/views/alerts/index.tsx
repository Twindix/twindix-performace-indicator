import { useState } from "react";
import { Bell, Check, CheckCheck, Pencil, Plus, Trash2 } from "lucide-react";

import { Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { AlertsSkeleton } from "@/components/skeletons";
import { AlertsProvider, useAlerts } from "@/contexts";
import { t, useAcknowledgeAlert, useAuth, useCreateAlert, useDeleteAlert, useDoneAlert, usePageLoader, useUpdateAlert } from "@/hooks";
import type { AlertInterface, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/ui";
import { formatDateTime, getStorageItem, storageKeys } from "@/utils";

export const AlertsView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <AlertsProvider sprintId={activeSprintId}>
            <AlertsViewInner />
        </AlertsProvider>
    );
};

const emptyForm = { title: "", body: "", target: "everyone", mentioned_user_ids: [] as string[] };

const AlertsViewInner = () => {
    const pageLoading = usePageLoader();
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();
    const { alerts, isLoading: isFetching, patchAlertLocal, removeAlertLocal, refetchCount } = useAlerts();
    const { createHandler: createAlertHandler, isLoading: isCreating } = useCreateAlert();
    const { updateHandler: updateAlertHandler, isLoading: isUpdating } = useUpdateAlert();
    const { deleteHandler: deleteAlertHandler } = useDeleteAlert();
    const { acknowledgeHandler: ackAlertHandler } = useAcknowledgeAlert();
    const { doneHandler: doneAlertHandler } = useDoneAlert();

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const getMember = (id: string) => members.find((m) => m.id === id);

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AlertInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AlertInterface | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openEdit = (a: AlertInterface) => {
        setForm({
            title: a.title,
            body: a.body ?? a.description ?? "",
            target: a.target ?? "everyone",
            mentioned_user_ids: a.mentioned_user_ids ?? a.mentionedIds ?? [],
        });
        setEditTarget(a);
    };

    const handleAdd = async () => {
        if (!form.title.trim() || !activeSprintId) return;
        const res = await createAlertHandler(activeSprintId, {
            title: form.title.trim(),
            body: form.body.trim() || undefined,
            target: form.target,
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) {
            patchAlertLocal(res);
            refetchCount();
            setAddOpen(false);
            setForm(emptyForm);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateAlertHandler(editTarget.id, {
            title: form.title.trim(),
            body: form.body.trim() || undefined,
            target: form.target,
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) {
            patchAlertLocal(res);
            setEditTarget(null);
        }
    };

    const handleAcknowledge = async (id: string) => {
        const res = await ackAlertHandler(id);
        if (res) { patchAlertLocal(res); refetchCount(); }
    };

    const handleDone = async (id: string) => {
        const res = await doneAlertHandler(id);
        if (res) { patchAlertLocal(res); refetchCount(); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteAlertHandler(deleteTarget.id);
        if (ok) {
            removeAlertLocal(deleteTarget.id);
            refetchCount();
            setDeleteTarget(null);
        }
    };

    if (pageLoading || isFetching) return <AlertsSkeleton />;

    const pendingAlerts = alerts.filter((a) => (a.status ?? "pending") !== "acknowledged" && (a.status ?? "pending") !== "done");
    const acknowledgedAlerts = alerts.filter((a) => (a.status ?? "") === "acknowledged" || (a.status ?? "") === "done");

    const renderCard = (alert: AlertInterface) => {
        const creator = getMember(alert.createdById);
        const mentioned = alert.mentioned_user_ids ?? alert.mentionedIds ?? [];
        const body = alert.body ?? alert.description ?? "";
        const isOwner = user?.id === alert.createdById;

        return (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-text-dark">{alert.title}</h3>
                            {body && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{body}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {isOwner && (
                                <>
                                    <button onClick={() => openEdit(alert)} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteTarget(alert)} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-xs text-text-muted mt-2">
                        {creator && (
                            <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{creator.avatar}</AvatarFallback></Avatar>
                                <span>{creator.name}</span>
                            </div>
                        )}
                        {mentioned.length > 0 && (
                            <span>{mentioned.length} {t("mentioned")}</span>
                        )}
                        <span>{formatDateTime(alert.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleAcknowledge(alert.id)}>
                            <Check className="h-3 w-3" /> {t("Acknowledge")}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleDone(alert.id)}>
                            <CheckCheck className="h-3 w-3" /> {t("Mark Done")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div>
            <Header
                title={t("Team Alerts")}
                description={t("Create announcements and track acknowledgements")}
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
                    <TabsTrigger value="acknowledged">{t("Acknowledged")} ({acknowledgedAlerts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    {pendingAlerts.length === 0 ? (
                        <EmptyState icon={Bell} title={t("No Pending Alerts")} description={t("All clear!")} />
                    ) : (
                        <div className="flex flex-col gap-3">{pendingAlerts.map(renderCard)}</div>
                    )}
                </TabsContent>

                <TabsContent value="acknowledged" className="mt-4">
                    {acknowledgedAlerts.length === 0 ? (
                        <EmptyState icon={CheckCheck} title={t("Nothing acknowledged yet")} description="" />
                    ) : (
                        <div className="flex flex-col gap-3">{acknowledgedAlerts.map(renderCard)}</div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Add / Edit Dialog */}
            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) { setAddOpen(false); setEditTarget(null); setForm(emptyForm); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Alert") : t("Create Alert")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-3">
                        <div className="space-y-2">
                            <Label>{t("Title")} <span className="text-error">*</span></Label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("Announcement title")} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Body")}</Label>
                            <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Target")}</Label>
                            <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v, mentioned_user_ids: v === "everyone" ? [] : form.mentioned_user_ids })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">{t("Everyone")}</SelectItem>
                                    <SelectItem value="specific_users">{t("Specific Users")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {form.target === "specific_users" && (
                            <div className="space-y-2">
                                <Label>{t("Mention Users")}</Label>
                                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                                    {members.map((m) => {
                                        const checked = form.mentioned_user_ids.includes(m.id);
                                        return (
                                            <label key={m.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-muted">
                                                <input type="checkbox" checked={checked} onChange={(e) => {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        mentioned_user_ids: e.target.checked
                                                            ? [...prev.mentioned_user_ids, m.id]
                                                            : prev.mentioned_user_ids.filter((i) => i !== m.id),
                                                    }));
                                                }} />
                                                <span className="text-xs">{m.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={editTarget ? handleEdit : handleAdd} disabled={isCreating || isUpdating || !form.title.trim()}>
                            {(isCreating || isUpdating) ? t("Saving...") : editTarget ? t("Save") : t("Create")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
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
