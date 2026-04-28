import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { alertsConstants } from "@/constants";
import type {
    AlertCardComputedPropsInterface,
    AlertInterface,
    UseAlertsViewReturnInterface,
} from "@/interfaces";
import { useSprintStore } from "@/store";

import { useUsersList } from "../users";
import { usePermissions } from "../shared";
import { useAlertActions } from "./use-alert-actions";
import { useAlertForm } from "./use-alert-form";
import { useAlertsList } from "./use-alerts-list";

export const useAlertsView = (): UseAlertsViewReturnInterface => {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const { activeSprintId } = useSprintStore();
    const [typeFilter, setTypeFilter] = useState<string>("");

    const { alerts, isLoading, patchAlertLocal, removeAlertLocal } = useAlertsList(
        activeSprintId,
        typeFilter ? { type: typeFilter } : {},
    );
    const { users } = useUsersList();

    const form = useAlertForm({ activeSprintId, onSaved: patchAlertLocal });
    const alertActions = useAlertActions({ onPatch: patchAlertLocal, onRemove: removeAlertLocal });

    const onOpenTask = (taskId?: string | null) => {
        navigate(taskId ? `/tasks?taskId=${taskId}` : "/tasks");
    };

    const pendingAlerts = alerts.filter((a) => a.status !== alertsConstants.statuses.done);
    const doneAlerts = alerts.filter((a) => a.status === alertsConstants.statuses.done);

    const cardPropsFor = (alert: AlertInterface): AlertCardComputedPropsInterface => ({
        permissions: {
            edit: permissions.alerts.edit(alert),
            delete: permissions.alerts.delete(alert),
            acknowledge: permissions.alerts.acknowledge(alert),
            markDone: permissions.alerts.markDone(),
            goToTask: permissions.alerts.goToTask(),
        },
        busy: alertActions.busyFor(alert.id),
        actions: {
            onEdit: () => form.openEdit(alert),
            onDelete: () => alertActions.requestDelete(alert),
            onAcknowledge: () => alertActions.acknowledge(alert.id),
            onMarkDone: () => alertActions.markDone(alert.id),
            onOpenTask,
        },
    });

    return {
        permissions,
        typeFilter,
        setTypeFilter,
        pendingAlerts,
        doneAlerts,
        isLoading,
        users,
        form,
        actions: alertActions,
        onOpenTask,
        cardPropsFor,
    };
};
