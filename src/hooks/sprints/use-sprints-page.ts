import { useCallback, useState } from "react";

import { defaultSprintForm } from "@/constants";
import type {
    SprintFormStateInterface,
    SprintInterface,
    UseSprintsPageReturnInterface,
} from "@/interfaces";
import { buildSprintForm } from "@/lib/sprints";

import { useFormErrors, usePermissions } from "../shared";
import { useActivateSprint } from "./use-activate-sprint";
import { useCreateSprint } from "./use-create-sprint";
import { useDeleteSprint } from "./use-delete-sprint";
import { useSprintsList } from "./use-sprints-list";
import { useUpdateSprint } from "./use-update-sprint";

export const useSprintsPage = (): UseSprintsPageReturnInterface => {
    const p = usePermissions();
    const { sprints, isLoading, patchSprintLocal, removeSprintLocal } = useSprintsList();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isCreating } = useCreateSprint({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateSprint({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteSprint();
    const { activateHandler } = useActivateSprint();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SprintInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SprintInterface | null>(null);
    const [form, setForm] = useState<SprintFormStateInterface>(defaultSprintForm);

    const isSubmitting = isCreating || isUpdating;
    const isFormDialogOpen = addOpen || editTarget !== null;
    const isEditMode = editTarget !== null;
    const canSubmit = Boolean(form.name.trim() && form.start_date && form.end_date);

    const onPatchForm = useCallback((patch: Partial<SprintFormStateInterface>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    }, []);

    const closeFormDialog = useCallback(() => {
        setAddOpen(false);
        setEditTarget(null);
        setForm(defaultSprintForm);
        clearFieldErrors();
    }, [clearFieldErrors]);

    const onOpenAdd = useCallback(() => {
        setForm(defaultSprintForm);
        clearFieldErrors();
        setAddOpen(true);
    }, [clearFieldErrors]);

    const onOpenEdit = useCallback((sprint: SprintInterface) => {
        clearFieldErrors();
        setForm(buildSprintForm(sprint));
        setEditTarget(sprint);
    }, [clearFieldErrors]);

    const onSubmit = useCallback(async () => {
        if (!canSubmit) return;
        const payload = { name: form.name.trim(), start_date: form.start_date, end_date: form.end_date };
        if (editTarget) {
            const updated = await updateHandler(editTarget.id, payload);
            if (updated) { patchSprintLocal(updated); closeFormDialog(); }
        } else {
            const created = await createHandler(payload);
            if (created) { patchSprintLocal(created); closeFormDialog(); }
        }
    }, [canSubmit, form, editTarget, updateHandler, createHandler, patchSprintLocal, closeFormDialog]);

    const onOpenDelete = useCallback((sprint: SprintInterface) => setDeleteTarget(sprint), []);
    const onCloseDelete = useCallback(() => setDeleteTarget(null), []);

    const onConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        const ok = await deleteHandler(target.id);
        if (ok) removeSprintLocal(target.id);
    }, [deleteTarget, deleteHandler, removeSprintLocal]);

    const onActivate = useCallback(async (sprint: SprintInterface) => {
        const updated = await activateHandler(sprint.id);
        if (updated) patchSprintLocal(updated);
    }, [activateHandler, patchSprintLocal]);

    return {
        sprints,
        isLoading,
        permissions: {
            canCreate: p.sprints.create(),
            canEdit: p.sprints.edit(),
            canDelete: p.sprints.delete(),
            canActivate: p.sprints.activate(),
        },
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
            canSubmit,
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
        onActivate,
    };
};
