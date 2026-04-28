import { useCallback, useState } from "react";

import { defaultProjectForm } from "@/constants";
import type {
    ProjectFormStateInterface,
    ProjectInterface,
    UseProjectsPageReturnInterface,
} from "@/interfaces";
import { buildProjectForm } from "@/lib/projects";
import { useProjectStore } from "@/store";

import { useFormErrors, usePermissions } from "../shared";
import { useCreateProject } from "./use-create-project";
import { useDeleteProject } from "./use-delete-project";
import { useProjectsList } from "./use-projects-list";
import { useUpdateProject } from "./use-update-project";

export const useProjectsPage = (): UseProjectsPageReturnInterface => {
    const p = usePermissions();
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
    const [form, setForm] = useState<ProjectFormStateInterface>(defaultProjectForm);

    const isSubmitting = isCreating || isUpdating;
    const isFormDialogOpen = addOpen || editTarget !== null;
    const isEditMode = editTarget !== null;

    const onPatchForm = useCallback((patch: Partial<ProjectFormStateInterface>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    }, []);

    const closeFormDialog = useCallback(() => {
        setAddOpen(false);
        setEditTarget(null);
        setForm(defaultProjectForm);
        clearFieldErrors();
    }, [clearFieldErrors]);

    const onOpenAdd = useCallback(() => {
        setForm(defaultProjectForm);
        clearFieldErrors();
        setAddOpen(true);
    }, [clearFieldErrors]);

    const onOpenEdit = useCallback((project: ProjectInterface) => {
        clearFieldErrors();
        setForm(buildProjectForm(project));
        setEditTarget(project);
    }, [clearFieldErrors]);

    const onSubmit = useCallback(async () => {
        if (!form.name.trim()) return;
        if (editTarget) {
            const res = await updateHandler(editTarget.id, form);
            if (res) { patchProjectLocal(res); closeFormDialog(); }
        } else {
            const res = await createHandler(form);
            if (res) { prependProjectLocal(res); closeFormDialog(); }
        }
    }, [form, editTarget, updateHandler, createHandler, patchProjectLocal, prependProjectLocal, closeFormDialog]);

    const onOpenDelete = useCallback((project: ProjectInterface) => setDeleteTarget(project), []);
    const onCloseDelete = useCallback(() => setDeleteTarget(null), []);

    const onConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeProjectLocal(deleteTarget.id); setDeleteTarget(null); }
    }, [deleteTarget, deleteHandler, removeProjectLocal]);

    const onEnterProject = useCallback((project: ProjectInterface) => {
        onSetActiveProject(project.id);
        setOpenedProject(project);
    }, [onSetActiveProject]);

    const onLeaveProject = useCallback(() => setOpenedProject(null), []);

    return {
        projects,
        isLoading,
        permissions: {
            canCreate: p.projects.create(),
            canEdit: p.projects.edit(),
            canDelete: p.projects.delete(),
        },
        openedProject,
        onEnterProject,
        onLeaveProject,
        form: {
            value: form,
            onPatch: onPatchForm,
            getError,
            clearError,
        },
        formDialog: {
            isOpen: isFormDialogOpen,
            isEditMode,
            isSubmitting,
            onOpenAdd,
            onOpenEdit,
            onClose: closeFormDialog,
            onSubmit,
        },
        deleteDialog: {
            target: deleteTarget,
            isDeleting,
            onOpen: onOpenDelete,
            onClose: onCloseDelete,
            onConfirm: onConfirmDelete,
        },
    };
};
