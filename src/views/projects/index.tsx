import { useState } from "react";
import { ArrowLeft, Calendar, Edit, FolderKanban, MoreHorizontal, Plus, Trash2, Users } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { ProjectsSkeleton } from "@/components/skeletons";
import { t, useCreateProject, useDeleteProject, useFormErrors, useProjectsList, useUpdateProject } from "@/hooks";
import type { CreateProjectPayloadInterface, ProjectInterface } from "@/interfaces";
import { useProjectStore } from "@/store";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { SprintsView } from "@/views/sprints";

const emptyForm: CreateProjectPayloadInterface = {
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "planning",
};

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
    const { onSetActiveProject } = useProjectStore();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { projects, isLoading, prependProjectLocal, patchProjectLocal, removeProjectLocal } = useProjectsList();
    const { createHandler, isLoading: isCreating } = useCreateProject({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateProject({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteProject();

    const [openedProject, setOpenedProject] = useState<ProjectInterface | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ProjectInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProjectInterface | null>(null);
    const [form, setForm] = useState<CreateProjectPayloadInterface>(emptyForm);

    const isSubmitting = isCreating || isUpdating;

    const openAdd = () => { setForm(emptyForm); clearFieldErrors(); setAddOpen(true); };

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

    const closeDialogs = () => { setAddOpen(false); setEditTarget(null); setForm(emptyForm); clearFieldErrors(); };

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

    const enterProject = (project: ProjectInterface) => {
        onSetActiveProject(project.id);
        setOpenedProject(project);
    };

    if (openedProject) {
        return (
            <div>
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
        <div>
            <Header
                title={t("Projects")}
                description={t("Group your sprints into projects.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={openAdd}>
                        <Plus className="h-4 w-4" />
                        {t("Add Project")}
                    </Button>
                }
            />

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<ProjectsSkeleton />}
                empty={projects.length === 0}
                emptyState={<EmptyState icon={FolderKanban} title={t("No projects yet")} description={t("Create your first project to start organizing sprints.")} />}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => {
                        const sprintCount = project.sprint_count ?? project.sprints_count ?? 0;
                        const memberCount = project.member_count ?? project.members_count ?? 0;
                        return (
                            <Card key={project.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => enterProject(project)}
                                            className="flex items-start gap-3 text-start flex-1 min-w-0 cursor-pointer"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                                                <FolderKanban className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-semibold text-text-dark truncate">
                                                    {project.name}
                                                </h3>
                                                <Badge variant={STATUS_VARIANT[project.status]} className="mt-1 text-[10px]">
                                                    {t(STATUS_LABEL[project.status])}
                                                </Badge>
                                            </div>
                                        </button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(project)} className="gap-2 cursor-pointer">
                                                    <Edit className="h-4 w-4" /> {t("Edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteTarget(project)}
                                                    className="gap-2 text-error focus:text-error cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" /> {t("Delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {project.description && (
                                        <p className="text-xs text-text-muted line-clamp-2 mb-3">{project.description}</p>
                                    )}

                                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {project.start_date ?? "—"} → {project.end_date ?? "—"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-text-muted">
                                        <span>{sprintCount} {t("sprints")}</span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {memberCount}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
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
                                <Input
                                    id="pj-start"
                                    type="date"
                                    value={form.start_date ?? ""}
                                    onChange={(e) => { setForm({ ...form, start_date: e.target.value }); clearError("start_date"); }}
                                />
                                {getError("start_date") && <p className="text-xs text-error">{getError("start_date")}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pj-end">{t("End Date")}</Label>
                                <Input
                                    id="pj-end"
                                    type="date"
                                    value={form.end_date ?? ""}
                                    onChange={(e) => { setForm({ ...form, end_date: e.target.value }); clearError("end_date"); }}
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
