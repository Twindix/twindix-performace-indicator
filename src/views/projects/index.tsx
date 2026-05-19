import { useState } from "react";
import { ArrowLeft, BarChart3, Calendar, Edit, FolderKanban, LineChart, MoreHorizontal, Plus, Trash2, Users } from "lucide-react";

import { Badge, Button, Card, CardContent, DatePicker, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, Pagination, QueryBoundary } from "@/components/shared";
import { ScoreGauge } from "@/components/shared";
import { ProjectsSkeleton } from "@/components/skeletons";
import { t, useCreateProject, useDeleteProject, useFormErrors, usePermissions, useProjectAnalytics, useProjectsList, useUpdateProject } from "@/hooks";
import type { CreateProjectPayloadInterface, ProjectInterface } from "@/interfaces";
import { useProjectStore } from "@/store";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { SprintsView } from "@/views/sprints";

import { ProjectAnalyticsView } from "./ProjectAnalyticsView";

const todayIso = () => new Date().toISOString().split("T")[0];

const buildEmptyForm = (): CreateProjectPayloadInterface => ({
    name: "",
    description: "",
    start_date: todayIso(),
    end_date: "",
    status: "planning",
});

const STATUS_VARIANT: Record<ProjectInterface["status"], "success" | "warning" | "default" | "secondary"> = {
    active: "success",
    planning: "default",
    on_hold: "warning",
    completed: "secondary",
};

const STATUS_LABEL: Record<ProjectInterface["status"], string> = {
    active: "Active",
    planning: "Planning",
    on_hold: "On Hold",
    completed: "Completed",
};

export const ProjectsView = () => {
    const p = usePermissions();
    const { onSetActiveProject } = useProjectStore();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { projects, meta, isLoading, setPage, setPerPage, prependProjectLocal, patchProjectLocal, removeProjectLocal } = useProjectsList();
    const { createHandler, isLoading: isCreating } = useCreateProject({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateProject({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteProject();

    const [openedProject, setOpenedProject] = useState<ProjectInterface | null>(null);
    const [analyticsProject, setAnalyticsProject] = useState<ProjectInterface | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ProjectInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProjectInterface | null>(null);
    const [form, setForm] = useState<CreateProjectPayloadInterface>(buildEmptyForm);

    const isSubmitting = isCreating || isUpdating;

    const openAdd = () => { setForm(buildEmptyForm()); clearFieldErrors(); setAddOpen(true); };

    const openEdit = (project: ProjectInterface) => {
        setEditTarget(project);
        clearFieldErrors();
        setForm({
            name: project.name,
            description: project.description ?? "",
            start_date: project.start_date ?? "",
            end_date: project.end_date ?? "",
            status: project.status,
        });
    };

    const closeDialogs = () => { setAddOpen(false); setEditTarget(null); setForm(buildEmptyForm()); clearFieldErrors(); };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        if (editTarget) {
            const res = await updateHandler(editTarget.id, form);
            if (res) { patchProjectLocal(res); closeDialogs(); }
        } else {
            const res = await createHandler(form);
            if (res) { prependProjectLocal(res); closeDialogs(); }
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeProjectLocal(deleteTarget.id); setDeleteTarget(null); }
    };

    const handleStatusChange = async (project: ProjectInterface, status: ProjectInterface["status"]) => {
        const res = await updateHandler(project.id, { status });
        if (res) patchProjectLocal(res);
    };

    const enterProject = (project: ProjectInterface) => {
        onSetActiveProject(project.id);
        setOpenedProject(project);
    };

    if (analyticsProject) {
        return (
            <ProjectAnalyticsView
                project={analyticsProject}
                onBack={() => setAnalyticsProject(null)}
                onViewSprints={() => {
                    onSetActiveProject(analyticsProject.id);
                    setOpenedProject(analyticsProject);
                    setAnalyticsProject(null);
                }}
            />
        );
    }

    if (openedProject) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="mb-4">
                    <Button variant="outline" size="sm" onClick={() => setOpenedProject(null)} className="gap-1.5">
                        <ArrowLeft className="h-4 w-4" />
                        {t("Back to Projects")}
                    </Button>
                    <p className="mt-3 text-xs text-text-muted">
                        {t("Project")}: <span className="font-semibold text-text-dark">{openedProject.name}</span>
                    </p>
                </div>
                <SprintsView />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title={t("Projects")}
                description={t("Group your sprints into projects.")}
                actions={
                    p.projects.create() ? (
                        <Button size="sm" className="gap-1.5" onClick={openAdd}>
                            <Plus className="h-4 w-4" />
                            {t("Add Project")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading && projects.length === 0}
                skeleton={<ProjectsSkeleton />}
                empty={projects.length === 0}
                emptyState={<EmptyState icon={FolderKanban} title={t("No projects yet")} description={t("Create your first project to start organizing sprints.")} />}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            canEdit={p.projects.edit()}
                            canDelete={p.projects.delete()}
                            canAnalytics={p.projects.viewAnalytics()}
                            onEdit={() => openEdit(project)}
                            onDelete={() => setDeleteTarget(project)}
                            onStatusChange={(status) => handleStatusChange(project, status)}
                            onAnalytics={() => setAnalyticsProject(project)}
                            onSprints={() => enterProject(project)}
                        />
                    ))}
                </div>

                <Pagination
                    meta={meta}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    isLoading={isLoading}
                />
            </QueryBoundary>

            {/* Add / Edit Dialog */}
            <Dialog
                open={addOpen || editTarget !== null}
                onOpenChange={(open) => { if (!open) closeDialogs(); }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Project") : t("Add Project")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="pj-name">{t("Name")} <span className="text-error">*</span></Label>
                            <Input
                                id="pj-name"
                                value={form.name}
                                onChange={(e) => { setForm({ ...form, name: e.target.value }); clearError("name"); }}
                                placeholder={t("Project name")}
                            />
                            {getError("name") && <p className="text-xs text-error">{getError("name")}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pj-desc">{t("Description")}</Label>
                            <Textarea
                                id="pj-desc"
                                rows={3}
                                value={form.description ?? ""}
                                onChange={(e) => { setForm({ ...form, description: e.target.value }); clearError("description"); }}
                                placeholder={t("What is this project about?")}
                            />
                            {getError("description") && <p className="text-xs text-error">{getError("description")}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="pj-start">{t("Start Date")}</Label>
                                <DatePicker
                                    id="pj-start"
                                    value={form.start_date ?? ""}
                                    onChange={(v) => { setForm({ ...form, start_date: v }); clearError("start_date"); }}
                                />
                                {getError("start_date") && <p className="text-xs text-error">{getError("start_date")}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pj-end">{t("End Date")}</Label>
                                <DatePicker
                                    id="pj-end"
                                    min={form.start_date ?? ""}
                                    value={form.end_date ?? ""}
                                    onChange={(v) => { setForm({ ...form, end_date: v }); clearError("end_date"); }}
                                />
                                {getError("end_date") && <p className="text-xs text-error">{getError("end_date")}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pj-status">{t("Status")}</Label>
                            <Select
                                value={form.status}
                                onValueChange={(value) => setForm({ ...form, status: value as ProjectInterface["status"] })}
                            >
                                <SelectTrigger id="pj-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(STATUS_LABEL) as ProjectInterface["status"][]).map((s) => (
                                        <SelectItem key={s} value={s}>{t(STATUS_LABEL[s])}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button onClick={handleSave} loading={isSubmitting} disabled={!form.name.trim()}>
                            {editTarget ? t("Save Changes") : t("Create Project")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("Delete Project")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-muted mt-2">
                        {t("Are you sure you want to delete")} <strong>{deleteTarget?.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isDeleting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

interface ProjectCardProps {
    project: ProjectInterface;
    canEdit: boolean;
    canDelete: boolean;
    canAnalytics: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: ProjectInterface["status"]) => void;
    onAnalytics: () => void;
    onSprints: () => void;
}

const ProjectCard = ({ project, canEdit, canDelete, canAnalytics, onEdit, onDelete, onStatusChange, onAnalytics, onSprints }: ProjectCardProps) => {
    const sprintCount = project.sprint_count ?? project.sprints_count ?? 0;
    const memberCount = project.member_count ?? project.members_count ?? 0;
    const hasStarted = project.status === "active";
    const { analytics } = useProjectAnalytics(canAnalytics && hasStarted ? project.id : "");
    const stats = analytics?.stats;
    const tasksDone = stats?.tasks_done ?? 0;
    const tasksTotal = project.tasks_total ?? stats?.tasks_total ?? 0;
    const tasksProgress = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
    const completion = stats?.completion ?? 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                            <FolderKanban className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-text-dark truncate">{project.name}</h3>
                            <Badge variant={STATUS_VARIANT[project.status]} className="mt-1 text-[10px]">
                                {t(STATUS_LABEL[project.status])}
                            </Badge>
                        </div>
                    </div>

                    {(canEdit || canDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                {canEdit && (
                                    <DropdownMenuItem onClick={onEdit} className="gap-2">
                                        <Edit className="h-4 w-4" /> {t("Edit")}
                                    </DropdownMenuItem>
                                )}
                                {canEdit && (
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="gap-2">
                                            <LineChart className="h-4 w-4" /> {t("Change Status")}
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuLabel>{t("Set Status")}</DropdownMenuLabel>
                                            {(Object.keys(STATUS_LABEL) as ProjectInterface["status"][]).map((s) => (
                                                <DropdownMenuItem
                                                    key={s}
                                                    disabled={s === project.status}
                                                    onClick={() => onStatusChange(s)}
                                                    className="gap-2"
                                                >
                                                    <Badge variant={STATUS_VARIANT[s]} className="text-[10px] pointer-events-none">
                                                        {t(STATUS_LABEL[s])}
                                                    </Badge>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                )}
                                {canDelete && <DropdownMenuSeparator />}
                                {canDelete && (
                                    <DropdownMenuItem onClick={onDelete} className="gap-2 text-error focus:text-error">
                                        <Trash2 className="h-4 w-4" /> {t("Delete")}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {project.description && (
                    <p className="text-xs text-text-muted line-clamp-2 mb-3">{project.description}</p>
                )}

                <div className="flex items-center gap-1 text-[11px] text-text-muted mb-3">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {project.start_date ?? "—"} → {project.end_date ?? "—"}
                </div>

                {canAnalytics && hasStarted ? (
                    <div className="flex items-center gap-3 mb-3">
                        <ScoreGauge score={completion} size="sm" label={t("done")} />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="rounded-md bg-muted/40 px-2 py-1.5">
                                <p className="text-[10px] uppercase tracking-wide text-text-muted">{t("On-Time")}</p>
                                <p className="text-sm font-bold text-success">{stats?.on_time_rate ?? 0}%</p>
                            </div>
                            <div className="rounded-md bg-muted/40 px-2 py-1.5">
                                <p className="text-[10px] uppercase tracking-wide text-text-muted">{t("Blockers")}</p>
                                <p className={`text-sm font-bold ${(stats?.open_blockers ?? 0) > 0 ? "text-error" : "text-text-dark"}`}>{stats?.open_blockers ?? 0}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                        <span>{t("Tasks")}</span>
                        <span>{tasksDone} / {tasksTotal}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-success transition-all" style={{ width: `${tasksProgress}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-text-muted mb-3">
                    <span>{sprintCount} {t("sprints")}</span>
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {memberCount}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {canAnalytics && (
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={onAnalytics}>
                            <LineChart className="h-3.5 w-3.5" />
                            {t("Analytics")}
                        </Button>
                    )}
                    <Button size="sm" className={`gap-1.5 ${canAnalytics ? "flex-1" : "w-full"}`} onClick={onSprints}>
                        <BarChart3 className="h-3.5 w-3.5" />
                        {t("Sprints")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

