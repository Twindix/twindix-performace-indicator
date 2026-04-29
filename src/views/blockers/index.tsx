import { Plus, ShieldAlert } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { BlockersSkeleton } from "@/components/skeletons";
import { EntityList, FiltersBar, Header, SelectField } from "@/components/shared";
import { blockersConstants } from "@/constants";
import { t, useBlockersView, usePageLoader } from "@/hooks";
import { cn } from "@/utils";

import { BlockerCard, BlockersStats } from "@/components/blockers";
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
            <Header
                title={t("Blocker Tracker")}
                description={t("Track and manage blockers affecting sprint delivery")}
                actions={
                    view.permissions.blockers.create() ? (
                        <Button size="sm" className="gap-1.5" onClick={view.formDialog.openAdd}>
                            <Plus className="h-4 w-4" />
                            {t("Add Blocker")}
                        </Button>
                    ) : null
                }
            />

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

            <div className={cn("flex flex-col", view.compact ? "gap-2" : "gap-4")}>
                <h2 className="text-lg font-semibold text-text-dark">
                    {t("Blockers")}
                    <Badge className="ms-2" variant="secondary">{view.blockers.length}</Badge>
                </h2>
                <EntityList
                    items={view.blockers}
                    emptyIcon={ShieldAlert}
                    emptyTitle={t("No blockers found")}
                    emptyDescription={t("No blockers match the current filters")}
                    className={view.compact ? "gap-2" : "gap-4"}
                    renderItem={(blocker) => (
                        <BlockerCard
                            key={blocker.id}
                            blocker={blocker}
                            compact={view.compact}
                            onClick={() => view.detailDialog.open(blocker)}
                        />
                    )}
                />
            </div>

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
