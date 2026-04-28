import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { DecisionsSkeleton } from "@/components/skeletons";
import { DecisionStatus } from "@/enums";
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

import { DecisionsFilters, DecisionsList, DecisionsStats } from "./components";
import { AddDecisionDialog, DecisionDetailDialog } from "./dialogs";

const initialFilters: DecisionsPageFiltersInterface = { status: "all", category: "all" };

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

                <DecisionsFilters
                    filters={filters}
                    count={decisions.length}
                    compact={compact}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                />

                {decisions.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title={t("No decisions found")}
                        description={t("No decisions match the selected filters")}
                    />
                ) : (
                    <DecisionsList
                        decisions={decisions}
                        canSetStatus={p.decisions.setStatus()}
                        compact={compact}
                        onView={handleView}
                        onSetStatus={handleSetStatus}
                    />
                )}

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
