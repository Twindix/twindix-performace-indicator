import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCheck, Pencil, Plus, Trash2, Users, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { AlertsSkeleton } from "@/components/skeletons";
import { t, useAuth, usePageLoader } from "@/hooks";
import type { AlertInterface, UserInterface } from "@/interfaces";
import { useAlertStore, useSprintStore } from "@/store";
import {
    Avatar,
    AvatarFallback,
    Checkbox,
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/ui";
import { cn, formatDateTime, getStorageItem, storageKeys } from "@/utils";

export const AlertsView = () => {
    const isLoading = usePageLoader();
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();
    const { alerts, load, add, update, remove, resolve } = useAlertStore();
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    useEffect(() => { load(); }, [load]);

    const sprintAlerts = alerts
        .filter((a) => a.sprintId === activeSprintId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const isPending = (a: AlertInterface) => {
        const total = a.mentionedIds.length === 0 ? members.length : a.mentionedIds.length;
        return a.resolvedByIds.length < total;
    };

    const pendingAlerts = sprintAlerts.filter(isPending);
    const acknowledgedAlerts = sprintAlerts.filter((a) => !isPending(a));

    // Pending filters
    const [pendingMentionFilter, setPendingMentionFilter] = useState("all");
    const [pendingCreatorFilter, setPendingCreatorFilter] = useState("all");

    // Acknowledged filters
    const [ackCreatorFilter, setAckCreatorFilter] = useState("all");
    const [ackFromDate, setAckFromDate] = useState("");
    const [ackToDate, setAckToDate] = useState("");

    const filteredPending = pendingAlerts.filter((a) => {
        if (pendingMentionFilter === "me") {
            if (a.mentionedIds.length > 0 && !a.mentionedIds.includes(user?.id ?? "")) return false;
        } else if (pendingMentionFilter === "everyone") {
            if (a.mentionedIds.length !== 0) return false;
        }
        if (pendingCreatorFilter !== "all" && a.createdById !== pendingCreatorFilter) return false;
        return true;
    });

    const filteredAck = acknowledgedAlerts.filter((a) => {
        if (ackCreatorFilter !== "all" && a.createdById !== ackCreatorFilter) return false;
        if (ackFromDate && new Date(a.createdAt) < new Date(ackFromDate)) return false;
        if (ackToDate && new Date(a.createdAt) > new Date(`${ackToDate}T23:59:59Z`)) return false;
        return true;
    });

    const [addOpen, setAddOpen] = useState(false);
    const [viewTarget, setViewTarget] = useState<AlertInterface | null>(null);
    const [editTarget, setEditTarget] = useState<AlertInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AlertInterface | null>(null);
    const [form, setForm] = useState({ title: "", description: "", mentionedIds: [] as string[] });
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

    const getMember = (id: string) => members.find((m) => m.id === id);

    const canAcknowledge = (alert: AlertInterface) => {
        if (!user) return false;
        const isMentioned = alert.mentionedIds.length === 0 || alert.mentionedIds.includes(user.id);
        return isMentioned && !alert.resolvedByIds.includes(user.id);
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!form.title.trim()) e.title = t("Title is required");
        if (!form.description.trim()) e.description = t("Description is required");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const openAdd = () => { setForm({ title: "", description: "", mentionedIds: [] }); setErrors({}); setAddOpen(true); };
    const openEdit = (a: AlertInterface) => { setForm({ title: a.title, description: a.description, mentionedIds: a.mentionedIds }); setErrors({}); setEditTarget(a); };

    const handleAdd = () => {
        if (!validate()) return;
        const now = new Date().toISOString();
        add({ id: `alt-${Date.now()}`, title: form.title.trim(), description: form.description.trim(), mentionedIds: form.mentionedIds, resolvedByIds: [], createdById: user?.id ?? "unknown", createdAt: now, updatedAt: now, sprintId: activeSprintId });
        setAddOpen(false);
    };

    const handleEdit = () => {
        if (!validate() || !editTarget) return;
        update(editTarget.id, { title: form.title.trim(), description: form.description.trim(), mentionedIds: form.mentionedIds });
        setEditTarget(null);
    };

    const handleDelete = () => { if (!deleteTarget) return; remove(deleteTarget.id); setDeleteTarget(null); };

    // unique creators for filter dropdowns
    const pendingCreators = Array.from(new Set(pendingAlerts.map((a) => a.createdById))).map(getMember).filter(Boolean) as UserInterface[];
    const ackCreators = Array.from(new Set(acknowledgedAlerts.map((a) => a.createdById))).map(getMember).filter(Boolean) as UserInterface[];

    const hasPendingFilters = pendingMentionFilter !== "all" || pendingCreatorFilter !== "all";
    const hasAckFilters = ackCreatorFilter !== "all" || ackFromDate || ackToDate;

    if (isLoading) return <AlertsSkeleton />;

    return (
        <div>
            <Header title={t("Alerts")} description={t("Team-wide announcements and action items for this sprint")} />

            <div className="flex justify-end mb-6">
                <Button onClick={openAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("New Alert")}
                </Button>
            </div>

            {sprintAlerts.length === 0 ? (
                <EmptyState icon={BellOff} title={t("No Alerts")} description={t("No alerts for this sprint yet.")} />
            ) : (
                <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending" className="gap-2">
                            {t("Pending")}
                            {pendingAlerts.length > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white px-1">
                                    {pendingAlerts.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="acknowledged" className="gap-2">
                            {t("Acknowledged")}
                            {acknowledgedAlerts.length > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white px-1">
                                    {acknowledgedAlerts.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Pending tab ── */}
                    <TabsContent value="pending" className="mt-4">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Select value={pendingMentionFilter} onValueChange={setPendingMentionFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder={t("Mention")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Mentions")}</SelectItem>
                                    <SelectItem value="me">{t("Mentioned me")}</SelectItem>
                                    <SelectItem value="everyone">{t("Everyone")}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={pendingCreatorFilter} onValueChange={setPendingCreatorFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder={t("Created by")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Creators")}</SelectItem>
                                    {pendingCreators.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {hasPendingFilters && (
                                <button onClick={() => { setPendingMentionFilter("all"); setPendingCreatorFilter("all"); }} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-dark cursor-pointer">
                                    <X className="h-3.5 w-3.5" />{t("Clear")}
                                </button>
                            )}
                            <span className="ms-auto text-xs text-text-muted">{filteredPending.length} / {pendingAlerts.length}</span>
                        </div>

                        {filteredPending.length === 0 ? (
                            <EmptyState icon={CheckCheck} title={t("All caught up")} description={t("No pending alerts match the filters.")} />
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredPending.map((alert) => (
                                    <AlertCard key={alert.id} alert={alert} members={members} userId={user?.id ?? ""} canAck={canAcknowledge(alert)} isOwner={user?.id === alert.createdById} onAck={() => resolve(alert.id, user!.id)} onView={() => setViewTarget(alert)} onEdit={() => openEdit(alert)} onDelete={() => setDeleteTarget(alert)} getMember={getMember} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Acknowledged tab ── */}
                    <TabsContent value="acknowledged" className="mt-4">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Select value={ackCreatorFilter} onValueChange={setAckCreatorFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder={t("Created by")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Creators")}</SelectItem>
                                    {ackCreators.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <Input type="date" value={ackFromDate} onChange={(e) => setAckFromDate(e.target.value)} className="h-9 w-auto" />
                                <span className="text-xs text-text-muted">{t("to")}</span>
                                <Input type="date" value={ackToDate} onChange={(e) => setAckToDate(e.target.value)} className="h-9 w-auto" />
                            </div>

                            {hasAckFilters && (
                                <button onClick={() => { setAckCreatorFilter("all"); setAckFromDate(""); setAckToDate(""); }} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-dark cursor-pointer">
                                    <X className="h-3.5 w-3.5" />{t("Clear")}
                                </button>
                            )}
                            <span className="ms-auto text-xs text-text-muted">{filteredAck.length} / {acknowledgedAlerts.length}</span>
                        </div>

                        {filteredAck.length === 0 ? (
                            <EmptyState icon={BellOff} title={t("No results")} description={t("No acknowledged alerts match the filters.")} />
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredAck.map((alert) => (
                                    <AlertCard key={alert.id} alert={alert} members={members} userId={user?.id ?? ""} canAck={false} isOwner={user?.id === alert.createdById} onAck={() => {}} onView={() => setViewTarget(alert)} onEdit={() => openEdit(alert)} onDelete={() => setDeleteTarget(alert)} getMember={getMember} dimmed />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* Details Dialog */}
            <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-warning" />
                            {viewTarget?.title}
                        </DialogTitle>
                    </DialogHeader>
                    {viewTarget && (() => {
                        const creator = getMember(viewTarget.createdById);
                        const mentionedAll = viewTarget.mentionedIds.length === 0;
                        const mentionedMembers = viewTarget.mentionedIds.map((id) => getMember(id)).filter(Boolean) as UserInterface[];
                        const resolvedMembers = viewTarget.resolvedByIds.map((id) => getMember(id)).filter(Boolean) as UserInterface[];
                        const totalMentioned = mentionedAll ? members.length : viewTarget.mentionedIds.length;
                        return (
                            <div className="flex flex-col gap-4 py-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {viewTarget.resolvedByIds.length >= totalMentioned
                                        ? <Badge variant="success">{t("Acknowledged")}</Badge>
                                        : <Badge variant="warning">{t("Pending")}</Badge>
                                    }
                                    {mentionedAll
                                        ? <Badge variant="secondary"><Users className="h-3 w-3 me-1" />{t("Everyone")}</Badge>
                                        : null
                                    }
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Description")}</p>
                                    <p className="text-sm text-text-secondary">{viewTarget.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1.5">{t("Created by")}</p>
                                        {creator && (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{creator.avatar}</AvatarFallback></Avatar>
                                                <span className="text-sm text-text-secondary">{creator.name}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-text-muted mt-1">{formatDateTime(viewTarget.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1.5">{t("Mentioned")}</p>
                                        {mentionedAll ? (
                                            <p className="text-sm text-text-secondary">{t("Everyone")}</p>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {mentionedMembers.map((m) => (
                                                    <div key={m.id} className="flex items-center gap-1.5">
                                                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{m.avatar}</AvatarFallback></Avatar>
                                                        <span className="text-xs text-text-secondary">{m.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-medium text-text-muted mb-2">
                                        <CheckCheck className="h-3.5 w-3.5 inline me-1" />
                                        {t("Acknowledged by")} ({resolvedMembers.length}/{totalMentioned})
                                    </p>
                                    {resolvedMembers.length === 0 ? (
                                        <p className="text-xs text-text-muted">{t("No one yet")}</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {resolvedMembers.map((m) => (
                                                <div key={m.id} className="flex items-center gap-1.5 rounded-full bg-success-light px-2 py-0.5">
                                                    <Avatar className="h-4 w-4"><AvatarFallback className="text-[7px]">{m.avatar}</AvatarFallback></Avatar>
                                                    <span className="text-xs text-success font-medium">{m.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-warning" />
                            {t("New Alert")}
                        </DialogTitle>
                    </DialogHeader>
                    <AlertForm form={form} setForm={setForm} errors={errors} members={members} />
                    <div className="flex justify-end gap-2 mt-2">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={handleAdd}>{t("Submit")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            {t("Edit Alert")}
                        </DialogTitle>
                    </DialogHeader>
                    <AlertForm form={form} setForm={setForm} errors={errors} members={members} />
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={() => setEditTarget(null)}>{t("Cancel")}</Button>
                        <Button onClick={handleEdit}>{t("Save Changes")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className="text-error">{t("Delete Alert")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {t("Are you sure you want to delete")} <span className="font-semibold text-text-dark">"{deleteTarget?.title}"</span>? {t("This cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

/* ---------- Alert Card ---------- */
interface AlertCardProps {
    alert: AlertInterface;
    members: UserInterface[];
    userId: string;
    canAck: boolean;
    isOwner: boolean;
    onAck: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    getMember: (id: string) => UserInterface | undefined;
    dimmed?: boolean;
}

const AlertCard = ({ alert, members, userId, canAck, isOwner, onAck, onView, onEdit, onDelete, getMember, dimmed }: AlertCardProps) => {
    const creator = getMember(alert.createdById);
    const mentionedAll = alert.mentionedIds.length === 0;
    const mentionedMembers = alert.mentionedIds.map((id) => getMember(id)).filter(Boolean) as UserInterface[];
    const resolvedCount = alert.resolvedByIds.length;
    const totalMentioned = mentionedAll ? members.length : alert.mentionedIds.length;
    const myResolved = alert.resolvedByIds.includes(userId);

    return (
        <Card className={cn("transition-opacity cursor-pointer hover:shadow-md", dimmed && "opacity-60")} onClick={onView}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn("mt-0.5 shrink-0", dimmed ? "text-success" : "text-warning")}>
                            <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-sm font-semibold text-text-dark">{alert.title}</h3>
                                {dimmed
                                    ? <Badge variant="success">{t("Acknowledged")}</Badge>
                                    : <Badge variant="warning">{t("Pending")}</Badge>
                                }
                                {mentionedAll
                                    ? <Badge variant="secondary"><Users className="h-3 w-3 me-1" />{t("Everyone")}</Badge>
                                    : mentionedMembers.map((m) => (
                                        <div key={m.id} className="flex items-center gap-1">
                                            <Avatar className="h-4 w-4"><AvatarFallback className="text-[7px]">{m.avatar}</AvatarFallback></Avatar>
                                            <span className="text-xs text-text-secondary">{m.name}</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <p className="text-sm text-text-secondary mb-3">{alert.description}</p>
                            <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                                {creator && (
                                    <div className="flex items-center gap-1.5">
                                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{creator.avatar}</AvatarFallback></Avatar>
                                        <span>{creator.name}</span>
                                    </div>
                                )}
                                <span>{formatDateTime(alert.createdAt)}</span>
                                <span className="flex items-center gap-1">
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    {resolvedCount}/{totalMentioned} {t("acknowledged")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {canAck && (
                            <Button variant="outline" size="sm" onClick={onAck} className="gap-1.5 text-success border-success hover:bg-success-light">
                                <CheckCheck className="h-3.5 w-3.5" />
                                {t("Acknowledge")}
                            </Button>
                        )}
                        {!canAck && myResolved && !dimmed && (
                            <span className="text-xs text-success font-medium flex items-center gap-1 me-1">
                                <CheckCheck className="h-3.5 w-3.5" />
                                {t("Done")}
                            </span>
                        )}
                        {isOwner && (
                            <>
                                <button onClick={onEdit} className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-lighter transition-colors cursor-pointer">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={onDelete} className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light transition-colors cursor-pointer">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

/* ---------- Form ---------- */
interface AlertFormProps {
    form: { title: string; description: string; mentionedIds: string[] };
    setForm: (f: AlertFormProps["form"]) => void;
    errors: { title?: string; description?: string };
    members: UserInterface[];
}

const AlertForm = ({ form, setForm, errors, members }: AlertFormProps) => {
    const allSelected = form.mentionedIds.length === members.length;

    const toggleMember = (id: string) => {
        const next = form.mentionedIds.includes(id)
            ? form.mentionedIds.filter((m) => m !== id)
            : [...form.mentionedIds, id];
        setForm({ ...form, mentionedIds: next });
    };

    const toggleAll = () => {
        setForm({ ...form, mentionedIds: allSelected ? [] : members.map((m) => m.id) });
    };

    return (
        <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="alt-title">{t("Title")}</Label>
                <Input
                    id="alt-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={t("Short alert title")}
                    className={errors.title ? "border-error" : ""}
                />
                {errors.title && <p className="text-xs text-error">{errors.title}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="alt-desc">{t("Description")}</Label>
                <textarea
                    id="alt-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t("Describe the alert and any required actions")}
                    rows={4}
                    className={cn(
                        "flex w-full rounded-[var(--radius-default)] border border-input bg-surface px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none transition-colors",
                        errors.description && "border-error",
                    )}
                />
                {errors.description && <p className="text-xs text-error">{errors.description}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label>{t("Mention")}</Label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-text-dark">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                        {t("Select all")}
                    </label>
                </div>
                <p className="text-xs text-text-muted -mt-1">{t("Leave empty to notify everyone")}</p>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {members.map((m) => (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer rounded-md p-1.5 hover:bg-muted transition-colors">
                            <Checkbox
                                checked={form.mentionedIds.includes(m.id)}
                                onCheckedChange={() => toggleMember(m.id)}
                            />
                            <Avatar className="h-5 w-5 shrink-0">
                                <AvatarFallback className="text-[8px]">{m.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-text-secondary truncate">{m.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};
