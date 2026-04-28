import { useState } from "react";

import { useCreateTeam, useDeleteTeam, useFormErrors, useGetTeams, usePermissions, useUpdateTeam } from "@/hooks";
import type { TeamFormFieldsInterface, TeamFormHandlersInterface, TeamInterface, UseTeamsViewReturnInterface } from "@/interfaces";
import { unwrapTeam } from "@/lib/teams";

export const useTeamsView = (): UseTeamsViewReturnInterface => {
    const p = usePermissions();
    const { teams, isLoading, patchTeamLocal, removeTeamLocal } = useGetTeams();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isCreating } = useCreateTeam({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateTeam({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteTeam();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TeamInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TeamInterface | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [detailTeamId, setDetailTeamId] = useState<string | null>(null);

    const isSubmitting = isCreating || isUpdating;

    const closeDialog = () => {
        setAddOpen(false);
        setEditTarget(null);
        setName("");
        setDescription("");
        clearFieldErrors();
    };

    const onEdit = (team: TeamInterface) => {
        setEditTarget(team);
        setName(team.name);
        setDescription("");
        clearFieldErrors();
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (editTarget) {
            const res = await updateHandler(editTarget.id, { name: name.trim(), description: description.trim() || undefined });
            const team = unwrapTeam(res);
            if (team) { patchTeamLocal(team); closeDialog(); }
            return;
        }
        const res = await createHandler({ name: name.trim(), description: description.trim() || undefined });
        const team = unwrapTeam(res);
        if (team) { patchTeamLocal(team); closeDialog(); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeTeamLocal(deleteTarget.id); setDeleteTarget(null); }
    };

    const formFields: TeamFormFieldsInterface = {
        name,
        description,
        nameError: getError("name"),
        descriptionError: getError("description"),
    };

    const formHandlers: TeamFormHandlersInterface = {
        onNameChange: (v: string) => { setName(v); clearError("name"); },
        onDescriptionChange: (v: string) => { setDescription(v); clearError("description"); },
        onSubmit: handleSubmit,
        onClose: closeDialog,
    };

    return {
        teams,
        isLoading,
        addOpen,
        editTarget,
        deleteTarget,
        detailTeamId,
        formFields,
        formHandlers,
        isSubmitting,
        isDeleting,
        canCreate: p.teams.create(),
        canManage: p.teams.manage(),
        onCardClick: (id: string) => setDetailTeamId(id),
        onEdit,
        onDelete: (team: TeamInterface) => setDeleteTarget(team),
        onDeleteConfirm: handleDelete,
        onDeleteClose: () => setDeleteTarget(null),
        onDetailClose: () => setDetailTeamId(null),
        onAddOpen: () => { clearFieldErrors(); setAddOpen(true); },
    };
};
