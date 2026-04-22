import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Clock, ExternalLink, Link2, Pencil, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { AlertsSkeleton } from "@/components/skeletons";
import { t, useAcknowledgeAlert, useAlertsList, useCreateAlert, useDeleteAlert, useDoneAlert, useUpdateAlert, useUsersList } from "@/hooks";
import type { AlertInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/ui";
import { formatDateTime } from "@/utils";

interface AlertFormState {
    title: string;
    body: string;
    mentioned_user_ids: string[];
}

const emptyForm: AlertFormState = { title: "", body: "", mentioned_user_ids: [] };

const UserMultiSelect = ({
    users,
    selected,
    onChange,
}: {
    users: { id: string; full_name: string; avatar_initials: string }[];
    selected: string[];
    onChange: (ids: string[]) => void;
}) => {
    const [search, setSearch] = useState("");

    const filtered = users.filter((u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id: string) => {
        onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    };

    const selectedUsers = users.filter((u) => selected.includes(u.id));

    return (
        <div className="space-y-2">
            {/* Selected chips */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedUsers.map((u) => (
                        <span
                            key={u.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                            <span>{u.full_name}</span>
                            <button
                                type="button"
                                onClick={() => toggle(u.id)}
                                className="hover:text-error transition-colors cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("Search users...")}
                    className="pl-8 h-8 text-xs"
                />
            </div>

            {/* User list */}
            <div className="max-h-44 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {filtered.length === 0 ? (
                    <p className="text-xs text-text-muted p-3 text-center">{t("No users found")}</p>
                ) : (
                    filtered.map((u) => {
                        const isSelected = selected.includes(u.id);
                        return (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => toggle(u.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors cursor-pointer ${isSelected ? "bg-primary/5" : ""}`}
                            >
                                <Avatar className="h-6 w-6 shrink-0">
                                    <AvatarFallback className="text-[9px]">{u.avatar_initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs flex-1 text-text-dark">{u.full_name}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export const AlertsView = () => {
    const { activeSprintId } = useSprintStore();
    const [typeFilter, setTypeFilter] = useState<string>("");
    const { alerts, isLoading, patchAlertLocal, removeAlertLocal } = useAlertsList(activeSprintId, typeFilter ? { type: typeFilter } : {});
    const { createHandler, isLoading: isCreating } = useCreateAlert();
    const { updateHandler, isLoading: isUpdating } = useUpdateAlert();
    const { deleteHandler, isLoading: isDeleting } = useDeleteAlert();
    const { acknowledgeHandler, isLoading: isAcknowledging } = useAcknowledgeAlert();
    const { doneHandler, isLoading: isMarkingDone } = useDoneAlert();
    const { users } = useUsersList();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AlertInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AlertInterface | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [actingId, setActingId] = useState<string | null>(null);

    const openEdit = (a: AlertInterface) => {
        setForm({
            title: a.title,
            body: a.body,
            mentioned_user_ids: a.mentioned_users.map((u) => u.id),
        });
        setEditTarget(a);
    };

    const buildPayload = (f: AlertFormState) => ({
        title: f.title.trim(),
        body: f.body.trim() || undefined,
        target: f.mentioned_user_ids.length > 0 ? "specific_users" : "all",
        mentioned_user_ids: f.mentioned_user_ids.length > 0 ? f.mentioned_user_ids : undefined,
    });

    const handleAdd = async () => {
        if (!form.title.trim() || !activeSprintId) return;
        const res = await createHandler(activeSprintId, buildPayload(form));
        if (res) { patchAlertLocal(res); setAddOpen(false); setForm(emptyForm); }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateHandler(editTarget.id, buildPayload(form));
        if (res) { patchAlertLocal(res); setEditTarget(null); }
    };

    const handleAcknowledge = async (id: string) => {
        setActingId(id);
        const res = await acknowledgeHandler(id);
        if (res) patchAlertLocal(res);
        setActingId(null);
    };

    const handleDone = async (id: string) => {
        setActingId(id);
        const res = await doneHandler(id);
        if (res) patchAlertLocal(res);
        setActingId(null);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeAlertLocal(deleteTarget.id); setDeleteTarget(null); }
    };

    const pendingAlerts = alerts.filter((a) => a.status !== "done");
    const doneAlerts = alerts.filter((a) => a.status === "done");

    const navigate = useNavigate();

    const typeIcon = (type?: string) => {
        if (type === "auto_alarm") return <Clock className="h-3.5 w-3.5 text-warning shrink-0" aria-label={t("Auto deadline alarm")} />;
        if (type === "dependency_resolved") return <Link2 className="h-3.5 w-3.5 text-success shrink-0" aria-label={t("Dependency resolved")} />;
        if (type === "task_completion_review") return <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label={t("Task completion review")} />;
        if (type === "requirements_approved") return <Check className="h-3.5 w-3.5 text-success shrink-0" aria-label={t("Requirements approved")} />;
        return <Bell className="h-3.5 w-3.5 text-text-muted shrink-0" />;
    };

    const renderCard = (alert: AlertInterface) => (
        <Card key={alert.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-dark flex items-center gap-1.5">
                            {typeIcon(alert.type)}
                            <span className="truncate">{alert.title}</span>
                        </h3>
                        {alert.body && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{alert.body}</p>}
                        {alert.source_task && (
                            <button
                                type="button"
                                onClick={() => navigate(`/tasks?taskId=${alert.source_task!.id}`)}
                                className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                            >
                                <ExternalLink className="h-3 w-3" />
                                {alert.source_task.code ?? alert.source_task.title}
                            </button>
                        )}
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
                    {alert.creator ? (
                        <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px]">{alert.creator.avatar_initials}</AvatarFallback>
                            </Avatar>
                            <span>{alert.creator.full_name}</span>
                        </div>
                    ) : (
                        <span className="italic">{t("System")}</span>
                    )}
                    <Badge variant="outline" className="text-[10px]">{alert.target}</Badge>
                    <span className="ml-auto">{formatDateTime(alert.created_at)}</span>
                </div>

                {alert.mentioned_users.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {alert.mentioned_users.map((u) => (
                            <span key={u.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-text-dark">
                                <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px]">{u.avatar_initials}</AvatarFallback>
                                </Avatar>
                                {u.full_name}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-text-muted">
                        {t("Acknowledged")}: {alert.acknowledgment_count}/{alert.total_targets}
                    </span>
                    <div className="flex gap-1.5 ml-auto">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAcknowledge(alert.id)} loading={actingId === alert.id && isAcknowledging}>
                            {!(actingId === alert.id && isAcknowledging) && <Check className="h-3 w-3" />} {t("Acknowledge")}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDone(alert.id)} loading={actingId === alert.id && isMarkingDone}>
                            {!(actingId === alert.id && isMarkingDone) && <CheckCheck className="h-3 w-3" />} {t("Done")}
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

            <div className="flex flex-wrap gap-2 mb-4">
                {[
                    { value: "", label: "All" },
                    { value: "manual", label: "Manual" },
                    { value: "auto_alarm", label: "Deadline" },
                    { value: "dependency_resolved", label: "Dependency" },
                    { value: "task_completion_review", label: "Review" },
                    { value: "requirements_approved", label: "Approved" },
                ].map((chip) => (
                    <button
                        key={chip.value || "all"}
                        type="button"
                        onClick={() => setTypeFilter(chip.value)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${typeFilter === chip.value ? "bg-primary text-primary-foreground border-primary" : "bg-surface text-text-muted border-border hover:bg-muted"}`}
                    >
                        {t(chip.label)}
                    </button>
                ))}
            </div>

            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">{t("Pending")} ({pendingAlerts.length})</TabsTrigger>
                    <TabsTrigger value="done">{t("Done")} ({doneAlerts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    <QueryBoundary
                        isLoading={isLoading}
                        skeleton={<AlertsSkeleton />}
                        empty={pendingAlerts.length === 0}
                        emptyState={<EmptyState icon={Bell} title={t("No pending alerts")} description={t("All clear!")} />}
                    >
                        <div className="flex flex-col gap-3">{pendingAlerts.map(renderCard)}</div>
                    </QueryBoundary>
                </TabsContent>

                <TabsContent value="done" className="mt-4">
                    {doneAlerts.length === 0 ? (
                        <EmptyState icon={CheckCheck} title={t("No done alerts")} description="" />
                    ) : (
                        <div className="flex flex-col gap-3">{doneAlerts.map(renderCard)}</div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Add / Edit dialog */}
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
                            <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                {t("Mention Users")}
                                <span className="ms-2 text-[10px] text-text-muted font-normal">
                                    {form.mentioned_user_ids.length === 0 ? t("(sends to all)") : `(${form.mentioned_user_ids.length} ${t("selected")})`}
                                </span>
                            </Label>
                            <UserMultiSelect
                                users={users}
                                selected={form.mentioned_user_ids}
                                onChange={(ids) => setForm({ ...form, mentioned_user_ids: ids })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={editTarget ? handleEdit : handleAdd} loading={isCreating || isUpdating} disabled={!form.title.trim()}>
                            {editTarget ? t("Save") : t("Create")}
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
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
