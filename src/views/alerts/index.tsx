import { Bell, CheckCheck, Plus } from "lucide-react";

import { Button } from "@/atoms";
import { AlertsSkeleton } from "@/components/skeletons";
import { EmptyState, EntityCard, Header, QueryBoundary, TabsView } from "@/components/shared";
import { alertsConstants } from "@/constants";
import { t, useAlertsView } from "@/hooks";
import type { AlertInterface } from "@/interfaces";

import { AlertFooter, AlertHeader, AlertMentions, AlertMeta } from "@/components/alerts";
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
            <Header
                title={t("Alerts")}
                description={t("Create announcements and track acknowledgements.")}
                actions={
                    view.permissions.alerts.create() ? (
                        <Button onClick={view.form.open} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("Create Alert")}
                        </Button>
                    ) : null
                }
            />
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
            <TabsView
                tabs={[
                    {
                        value: "pending",
                        label: t("Pending"),
                        count: view.pendingAlerts.length,
                        children: (
                            <QueryBoundary
                                isLoading={view.isLoading}
                                skeleton={<AlertsSkeleton />}
                                empty={view.pendingAlerts.length === 0}
                                emptyState={<EmptyState icon={Bell} title={t("No pending alerts")} description={t("All clear!")} />}
                            >
                                <div className="flex flex-col gap-3">{view.pendingAlerts.map(renderCard)}</div>
                            </QueryBoundary>
                        ),
                    },
                    {
                        value: "done",
                        label: t("Done"),
                        count: view.doneAlerts.length,
                        children: view.doneAlerts.length === 0 ? (
                            <EmptyState icon={CheckCheck} title={t("No done alerts")} description="" />
                        ) : (
                            <div className="flex flex-col gap-3">{view.doneAlerts.map(renderCard)}</div>
                        ),
                    },
                ]}
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
