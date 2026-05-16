import { useState } from "react";
import { Calendar, Edit, LineChart, ListChecks, MoreHorizontal, Plus, Target, Trash2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header, Pagination, QueryBoundary } from "@/components/shared";
import { SprintsSkeleton } from "@/components/skeletons";
import { routesData } from "@/data";

const sprintCardFallback = { completion_rate: 0, on_time_rate: 0, days_left: 0, open_blockers: 0, tasks_done: 0, tasks_total: 0, story_points_done: 0, story_points_total: 0 };
import { t, useActivateSprint, useCreateSprint, useDeleteSprint, useFormErrors, usePermissions, useSprintsList, useUpdateSprint } from "@/hooks";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import { useProjectStore, useSprintStore } from "@/store";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";

import { SprintAnalyticsView } from "./SprintAnalyticsView";

const todayISO = () => new Date().toISOString().split("T")[0];
const buildEmptyForm = (): CreateSprintPayloadInterface => ({ name: "", start_date: todayISO(), end_date: "" });

export const SprintsView = () => {
    const p = usePermissions();
    const navigate = useNavigate();
    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const { onSetActiveSprint } = useSprintStore();
    const { sprints, meta, isLoading, setPage, setPerPage, patchSprintLocal, removeSprintLocal } = useSprintsList();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isCreating } = useCreateSprint({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateSprint({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteSprint();
    const { activateHandler } = useActivateSprint();

    const isSubmitting = isCreating || isUpdating;

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SprintInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SprintInterface | null>(null);
    const [form, setForm] = useState<CreateSprintPayloadInterface>(buildEmptyForm);
    const [analyticsSprint, setAnalyticsSprint] = useState<SprintInterface | null>(null);

    const openAdd = () => { setForm(buildEmptyForm()); setAddOpen(true); };

    const openEdit = (s: SprintInterface) => {
        setForm({ name: s.name, start_date: s.start_date, end_date: s.end_date });
        setEditTarget(s);
    };

    const closeDialogs = () => { setAddOpen(false); setEditTarget(null); setForm(buildEmptyForm()); clearFieldErrors(); };

    const handleSubmitAdd = async () => {
        if (!form.name.trim() || !form.start_date || !form.end_date || !activeProjectId) return;
        const created = await createHandler({
            projectId: activeProjectId,
            payload: { name: form.name.trim(), start_date: form.start_date, end_date: form.end_date },
        });
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

    const openTasks = (s: SprintInterface) => {
        onSetActiveSprint(s.id);
        navigate(routesData.tasks);
    };

    const statusBadge = (status: string | null) => {
        if (status === "active") return <Badge variant="success">{t("Active")}</Badge>;
        if (status === "completed") return <Badge variant="outline">{t("Completed")}</Badge>;
        return <Badge variant="secondary">{t("Planned")}</Badge>;
    };

    if (analyticsSprint) {
        return (
            <SprintAnalyticsView
                sprint={analyticsSprint}
                onBack={() => setAnalyticsSprint(null)}
                onViewTasks={() => openTasks(analyticsSprint)}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title={t("Sprints")}
                description={t("Manage sprints and activate the current one.")}
                actions={
                    p.sprints.create() ? (
                        <Button size="sm" className="gap-1.5" onClick={openAdd} disabled={!activeProjectId} title={!activeProjectId ? t("Pick a project first") : undefined}>
                            <Plus className="h-4 w-4" />
                            {t("Add Sprint")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading && sprints.length === 0}
                skeleton={<SprintsSkeleton />}
                empty={sprints.length === 0}
                emptyState={<EmptyState icon={Target} title={t("No sprints yet")} description={t("Create your first sprint to start planning work.")} />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sprints.map((s) => {
                        const a = sprintCardFallback;
                        return (
                        <Card key={s.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-text-dark truncate">{s.name}</h3>
                                        <div className="mt-1">{statusBadge(s.status)}</div>
                                    </div>
                                    {(p.sprints.edit() || p.sprints.activate() || p.sprints.delete()) && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-text-dark cursor-pointer">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {s.status !== "active" && p.sprints.activate() && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleActivate(s)} className="gap-2 cursor-pointer">
                                                            <Zap className="h-4 w-4" />{t("Activate")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </>
                                                )}
                                                {p.sprints.edit() && (
                                                    <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 cursor-pointer">
                                                        <Edit className="h-4 w-4" />{t("Edit")}
                                                    </DropdownMenuItem>
                                                )}
                                                {p.sprints.delete() && (
                                                    <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="gap-2 text-error focus:text-error cursor-pointer">
                                                        <Trash2 className="h-4 w-4" />{t("Delete")}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{s.start_date} → {s.end_date}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <SprintCardStat label={t("Done")} value={`${a.completion_rate}%`} tone="primary" />
                                    <SprintCardStat label={t("On-time")} value={`${a.on_time_rate}%`} tone="success" />
                                    <SprintCardStat label={t("Blockers")} value={a.open_blockers} tone={a.open_blockers > 0 ? "error" : "muted"} />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                        <span>{t("Tasks")}</span>
                                        <span>{a.tasks_done} / {a.tasks_total}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-success" style={{ width: `${Math.round((a.tasks_done / Math.max(a.tasks_total, 1)) * 100)}%` }} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setAnalyticsSprint(s)}>
                                        <LineChart className="h-3.5 w-3.5" />
                                        {t("Analytics")}
                                    </Button>
                                    <Button size="sm" className="flex-1 gap-1.5" onClick={() => openTasks(s)}>
                                        <ListChecks className="h-3.5 w-3.5" />
                                        {t("Tasks")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>

                <Pagination
                    meta={meta}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    isLoading={isLoading}
                />
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

interface SprintCardStatProps {
    label: string;
    value: string | number;
    tone: "primary" | "success" | "error" | "muted";
}

const SprintCardStat = ({ label, value, tone }: SprintCardStatProps) => {
    const toneClass = {
        primary: "text-primary-medium",
        success: "text-success",
        error: "text-error",
        muted: "text-text-muted",
    }[tone];
    return (
        <div className="rounded-md bg-muted/40 px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
            <p className={`text-sm font-bold ${toneClass}`}>{value}</p>
        </div>
    );
};

