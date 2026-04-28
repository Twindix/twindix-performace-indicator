import { BlockersSkeleton } from "@/components/skeletons";
import { FiltersBar, SelectField } from "@/components/shared";
import { blockersConstants } from "@/constants";
import { t, useBlockersView, usePageLoader } from "@/hooks";

import { BlockersHeader, BlockersList, BlockersStats } from "./components";
import { BlockerDetailDialog, BlockerFormDialog } from "./dialogs";

export const BlockerView = () => {
    const pageLoading = usePageLoader();
    const view = useBlockersView();

    if (pageLoading || view.isLoading) return <BlockersSkeleton />;

    const { values, onChange, onClear } = view.filters;
    const isAnyApplied = Object.values(values).some((v) => v !== "all");
    const userOptions = [
        { value: "all", label: t("All Users") },
        ...view.users.map((u) => ({ value: u.id, label: u.full_name })),
    ];

    return (
        <div>
            <BlockersHeader canCreate={view.permissions.blockers.create()} onCreate={view.formDialog.openAdd} />

            <BlockersStats stats={view.stats} compact={view.compact} />

            <FiltersBar
                count={view.blockers.length}
                countLabel={t("blockers")}
                hasFilters={isAnyApplied}
                onClear={onClear}
                compact={view.compact}
                showIcon
            >
                <SelectField
                    value={values.status}
                    onChange={(v) => onChange("status", v)}
                    options={blockersConstants.statusOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
                    placeholder={t("Status")}
                    triggerClassName="w-[140px] h-9 text-xs"
                />
                <SelectField
                    value={values.type}
                    onChange={(v) => onChange("type", v)}
                    options={[{ value: "all", label: t("All Types") }, ...blockersConstants.typeOptions.map((o) => ({ value: o.value, label: t(o.label) }))]}
                    placeholder={t("Type")}
                    triggerClassName="w-[160px] h-9 text-xs"
                />
                <SelectField
                    value={values.severity}
                    onChange={(v) => onChange("severity", v)}
                    options={[{ value: "all", label: t("All Severities") }, ...blockersConstants.severityOptions.map((o) => ({ value: o.value, label: t(o.label) }))]}
                    placeholder={t("Severity")}
                    triggerClassName="w-[140px] h-9 text-xs"
                />
                <SelectField
                    value={values.owner}
                    onChange={(v) => onChange("owner", v)}
                    options={[{ value: "all", label: t("All Owners") }, ...view.users.map((u) => ({ value: u.id, label: u.full_name }))]}
                    placeholder={t("Owner")}
                    triggerClassName="w-[160px] h-9 text-xs"
                />
                <SelectField
                    value={values.reporter}
                    onChange={(v) => onChange("reporter", v)}
                    options={[{ value: "all", label: t("All Reporters") }, ...userOptions.slice(1)]}
                    placeholder={t("Reporter")}
                    triggerClassName="w-[160px] h-9 text-xs"
                />
            </FiltersBar>

            <BlockersList blockers={view.blockers} compact={view.compact} onSelect={view.detailDialog.open} />

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
