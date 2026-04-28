import { EntityCard } from "@/components/shared";
import { alertsConstants } from "@/constants";
import { useAlertsView } from "@/hooks";
import type { AlertInterface } from "@/interfaces";

import { t } from "@/hooks";

import { AlertFooter, AlertHeader, AlertMentions, AlertMeta } from "./components/card";
import { AlertsHeader, AlertsTabs, DoneAlertsTab, PendingAlertsTab } from "./components";
import { AlertFormDialog, DeleteAlertDialog } from "./dialogs";

export const AlertsView = () => {
    const view = useAlertsView();

    const renderCard = (alert: AlertInterface) => {
        const { permissions, busy, actions } = view.cardPropsFor(alert);
        const isReviewTitle = alert.title === alertsConstants.titles.taskCompletionReviewRequired;
        return (
            <EntityCard key={alert.id}>
                <EntityCard.Row className="mb-2">
                    <AlertHeader
                        type={alert.type}
                        title={alert.title}
                        body={alert.body}
                        sourceTask={alert.source_task}
                        onOpenTask={actions.onOpenTask}
                    />
                    <EntityCard.Actions
                        canEdit={permissions.edit}
                        canDelete={permissions.delete}
                        onEdit={actions.onEdit}
                        onDelete={actions.onDelete}
                    />
                </EntityCard.Row>
                <AlertMeta creator={alert.creator} target={alert.target} createdAt={alert.created_at} />
                <AlertMentions users={alert.mentioned_users} />
                <AlertFooter
                    isReviewTitle={isReviewTitle}
                    sourceTaskId={alert.source_task?.id ?? null}
                    counts={{ acknowledged: alert.acknowledgment_count, total: alert.total_targets }}
                    permissions={permissions}
                    busy={busy}
                    actions={{ onAcknowledge: actions.onAcknowledge, onMarkDone: actions.onMarkDone, onOpenTask: actions.onOpenTask }}
                />
            </EntityCard>
        );
    };

    return (
        <div>
            <AlertsHeader canCreate={view.permissions.alerts.create()} onCreate={view.form.open} />
            <div className="flex flex-wrap gap-2 mb-4">
                {alertsConstants.filters.typeChips.map((chip) => (
                    <button
                        key={chip.value || "all"}
                        type="button"
                        onClick={() => view.setTypeFilter(chip.value)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${view.typeFilter === chip.value ? "bg-primary text-primary-foreground border-primary" : "bg-surface text-text-muted border-border hover:bg-muted"}`}
                    >
                        {t(chip.label)}
                    </button>
                ))}
            </div>
            <AlertsTabs
                pendingCount={view.pendingAlerts.length}
                doneCount={view.doneAlerts.length}
                pendingChildren={
                    <PendingAlertsTab isLoading={view.isLoading} isEmpty={view.pendingAlerts.length === 0}>
                        {view.pendingAlerts.map(renderCard)}
                    </PendingAlertsTab>
                }
                doneChildren={
                    <DoneAlertsTab isEmpty={view.doneAlerts.length === 0}>
                        {view.doneAlerts.map(renderCard)}
                    </DoneAlertsTab>
                }
            />
            <AlertFormDialog
                open={view.form.isOpen}
                isEdit={view.form.isEdit}
                isSubmitting={view.form.isSubmitting}
                form={{ value: view.form.value, onChange: view.form.onChange }}
                users={view.users}
                actions={{ onClose: view.form.close, onSubmit: view.form.onSubmit }}
            />
            <DeleteAlertDialog
                open={!!view.actions.deleteTarget}
                isLoading={view.actions.isDeleting}
                onClose={view.actions.cancelDelete}
                onConfirm={view.actions.confirmDelete}
            />
        </div>
    );
};
