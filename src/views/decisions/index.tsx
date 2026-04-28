import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/atoms";
import { EntityList, FiltersBar, Header, QueryBoundary, SelectField } from "@/components/shared";
import { DecisionsSkeleton } from "@/components/skeletons";
import { decisionsConstants } from "@/constants";
import { DecisionCategory, DecisionStatus } from "@/enums";
import {
    t,
    useDecisionViewActions,
    useDecisionsAnalytics,
    useDecisionsList,
    usePageLoader,
    usePermissions,
    useSettings,
} from "@/hooks";
import type { DecisionsPageFiltersInterface } from "@/interfaces/decisions";
import { useSprintStore } from "@/store";

import { DecisionCard, DecisionsStats } from "./components";
import { AddDecisionDialog, DecisionDetailDialog } from "./dialogs";

const initialFilters: DecisionsPageFiltersInterface = { status: "all", category: "all" };

const statusOptions = [
    { value: "all", label: "All Statuses" },
    ...Object.values(DecisionStatus).map((s) => ({ value: s, label: decisionsConstants.statusLabels[s] })),
];

const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...Object.values(DecisionCategory).map((c) => ({ value: c, label: decisionsConstants.categoryLabels[c] })),
];

export const DecisionsView = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();
    const p = usePermissions();

    const [filters, setFilters] = useState<DecisionsPageFiltersInterface>(initialFilters);
    const [addOpen, setAddOpen] = useState(false);

    const { decisions, isLoading: isFetching, patchDecisionLocal, removeDecisionLocal } = useDecisionsList(activeSprintId, {
        status:   filters.status   === "all" ? undefined : filters.status,
        category: filters.category === "all" ? undefined : filters.category,
    });
    const { analytics, refetch: refetchAnalytics } = useDecisionsAnalytics(activeSprintId);

    const { viewTarget, isLoadingDetail, handleView, handleSetStatus, handleDelete, closeView } = useDecisionViewActions({
        onPatched:     patchDecisionLocal,
        onRemoved:     removeDecisionLocal,
        onAfterChange: refetchAnalytics,
    });

    const handleFilterChange = <K extends keyof DecisionsPageFiltersInterface>(field: K, value: DecisionsPageFiltersInterface[K]) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };
    const handleClearFilters = () => setFilters(initialFilters);

    const totalCount    = analytics?.total    ?? decisions.length;
    const approvedCount = analytics?.approved ?? decisions.filter((d) => d.status === DecisionStatus.Approved).length;
    const pendingCount  = analytics?.pending  ?? decisions.filter((d) => d.status === DecisionStatus.Pending).length;
    const rejectedCount = analytics?.rejected ?? decisions.filter((d) => d.status === DecisionStatus.Rejected).length;

    const hasFilters = filters.status !== "all" || filters.category !== "all";

    return (
        <QueryBoundary isLoading={pageLoading || isFetching} skeleton={<DecisionsSkeleton />}>
            <div>
                <Header
                    title={t("Decision Log")}
                    description={t("Document and track important project decisions")}
                    actions={
                        p.decisions.create() ? (
                            <Button onClick={() => setAddOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("Add Decision")}
                            </Button>
                        ) : null
                    }
                />

                <DecisionsStats
                    total={totalCount}
                    approved={approvedCount}
                    pending={pendingCount}
                    rejected={rejectedCount}
                    compact={compact}
                />

                <FiltersBar
                    count={decisions.length}
                    countLabel={t("decisions")}
                    hasFilters={hasFilters}
                    onClear={handleClearFilters}
                    compact={compact}
                    showIcon
                >
                    <SelectField
                        value={filters.status}
                        onChange={(v) => handleFilterChange("status", v as DecisionStatus | "all")}
                        options={statusOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
                        placeholder={t("Status")}
                        triggerClassName="w-[150px] h-9 text-xs"
                    />
                    <SelectField
                        value={filters.category}
                        onChange={(v) => handleFilterChange("category", v as DecisionCategory | "all")}
                        options={categoryOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
                        placeholder={t("Category")}
                        triggerClassName="w-[160px] h-9 text-xs"
                    />
                </FiltersBar>

                <EntityList
                    items={decisions}
                    emptyIcon={BookOpen}
                    emptyTitle={t("No decisions found")}
                    emptyDescription={t("No decisions match the selected filters")}
                    className={compact ? "gap-2" : "gap-4"}
                    renderItem={(decision) => (
                        <DecisionCard
                            key={decision.id}
                            decision={decision}
                            canSetStatus={p.decisions.setStatus()}
                            compact={compact}
                            onView={handleView}
                            onSetStatus={handleSetStatus}
                        />
                    )}
                />

                <DecisionDetailDialog
                    target={viewTarget}
                    isLoadingDetail={isLoadingDetail}
                    permissions={{ setStatus: p.decisions.setStatus(), delete: p.decisions.delete() }}
                    onOpenChange={(open) => { if (!open) closeView(); }}
                    onSetStatus={handleSetStatus}
                    onDelete={handleDelete}
                />

                <AddDecisionDialog
                    open={addOpen}
                    onOpenChange={setAddOpen}
                    onCreated={(decision) => { patchDecisionLocal(decision); refetchAnalytics(); }}
                />
            </div>
        </QueryBoundary>
    );
};
