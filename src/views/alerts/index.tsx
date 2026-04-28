import { useAlertsView } from "@/hooks";
import type { AlertInterface } from "@/interfaces";

import {
    AlertCard,
    AlertsFilters,
    AlertsHeader,
    AlertsTabs,
    DoneAlertsTab,
    PendingAlertsTab,
} from "./components";
import { AlertFormDialog, DeleteAlertDialog } from "./dialogs";

export const AlertsView = () => {
    const view = useAlertsView();

    const renderCard = (alert: AlertInterface) => (
        <AlertCard key={alert.id} alert={alert} {...view.cardPropsFor(alert)} />
    );

    return (
        <div>
            <AlertsHeader canCreate={view.permissions.alerts.create()} onCreate={view.form.open} />

            <AlertsFilters value={view.typeFilter} onChange={view.setTypeFilter} />

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
