import { BlockersSkeleton } from "@/components/skeletons";
import { useBlockersView, usePageLoader } from "@/hooks";

import {
    BlockersFilters,
    BlockersHeader,
    BlockersList,
    BlockersStats,
} from "./components";
import { BlockerDetailDialog, BlockerFormDialog } from "./dialogs";

export const BlockerView = () => {
    const pageLoading = usePageLoader();
    const view = useBlockersView();

    if (pageLoading || view.isLoading) return <BlockersSkeleton />;

    return (
        <div>
            <BlockersHeader
                canCreate={view.permissions.blockers.create()}
                onCreate={view.formDialog.openAdd}
            />

            <BlockersStats stats={view.stats} compact={view.compact} />

            <BlockersFilters
                values={view.filters.values}
                onChange={view.filters.onChange}
                onClear={view.filters.onClear}
                users={view.users}
                blockerCount={view.blockers.length}
                compact={view.compact}
            />

            <BlockersList
                blockers={view.blockers}
                compact={view.compact}
                onSelect={view.detailDialog.open}
            />

            <BlockerFormDialog
                open={view.formDialog.isOpen}
                isEdit={view.formDialog.isEdit}
                isSubmitting={view.formDialog.isSubmitting}
                form={{ value: view.formDialog.value, onChange: view.formDialog.onChange }}
                users={view.users}
                actions={{ onClose: view.formDialog.close, onSubmit: view.formDialog.onSubmit }}
            />

            <BlockerDetailDialog
                open={view.detailDialog.isOpen}
                blocker={view.detailDialog.current}
                permissions={view.permissions}
                detail={view.detailDialog}
                actions={{
                    onClose: view.detailDialog.close,
                    onEdit: (blocker) => { view.detailDialog.close(); view.formDialog.openEdit(blocker); },
                }}
            />
        </div>
    );
};
