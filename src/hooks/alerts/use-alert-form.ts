import { useState } from "react";

import { alertsConstants } from "@/constants";
import type {
    AlertFormStateInterface,
    AlertInterface,
    UseAlertFormArgsInterface,
    UseAlertFormReturnInterface,
} from "@/interfaces";
import { buildAlertPayload } from "@/lib/alerts";

import { useCreateAlert } from "./use-create-alert";
import { useUpdateAlert } from "./use-update-alert";

export const useAlertForm = ({ activeSprintId, onSaved }: UseAlertFormArgsInterface): UseAlertFormReturnInterface => {
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AlertInterface | null>(null);
    const [form, setForm] = useState<AlertFormStateInterface>(alertsConstants.defaults.emptyForm);

    const { createHandler, isLoading: isCreating } = useCreateAlert();
    const { updateHandler, isLoading: isUpdating } = useUpdateAlert();

    const open = () => {
        setForm(alertsConstants.defaults.emptyForm);
        setAddOpen(true);
    };

    const openEdit = (alert: AlertInterface) => {
        setForm({
            title: alert.title,
            body: alert.body,
            mentioned_user_ids: alert.mentioned_users.map((u) => u.id),
        });
        setEditTarget(alert);
    };

    const close = () => {
        setAddOpen(false);
        setEditTarget(null);
        setForm(alertsConstants.defaults.emptyForm);
    };

    const onSubmit = async () => {
        if (!form.title.trim()) return;
        const payload = buildAlertPayload(form);
        if (editTarget) {
            const res = await updateHandler(editTarget.id, payload);
            if (res) { onSaved(res); close(); }
            return;
        }
        if (!activeSprintId) return;
        const res = await createHandler(activeSprintId, payload);
        if (res) { onSaved(res); close(); }
    };

    return {
        isOpen: addOpen || !!editTarget,
        isEdit: !!editTarget,
        isSubmitting: isCreating || isUpdating,
        value: form,
        onChange: setForm,
        open,
        openEdit,
        close,
        onSubmit,
    };
};
