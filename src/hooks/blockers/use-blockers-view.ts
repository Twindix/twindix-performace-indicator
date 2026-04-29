import { useMemo, useState } from "react";

import { blockersConstants } from "@/constants";
import { useUsersList } from "@/hooks";
import type {
    BlockersFiltersValuesInterface,
    UseBlockersViewReturnInterface,
} from "@/interfaces";
import { computeBlockerStats } from "@/lib/blockers";
import { useSprintStore } from "@/store";

import { usePermissions, useSettings } from "../shared";
import { useBlockerDetail } from "./use-blocker-detail";
import { useBlockerForm } from "./use-blocker-form";
import { useBlockersList } from "./use-blockers-list";

export const useBlockersView = (): UseBlockersViewReturnInterface => {
    const permissions = usePermissions();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();

    const [filterValues, setFilterValues] = useState<BlockersFiltersValuesInterface>(
        blockersConstants.defaults.filters,
    );

    const toApiFilters = (v: BlockersFiltersValuesInterface) => ({
        status: v.status === "all" ? undefined : v.status,
        type: v.type === "all" ? undefined : v.type,
        severity: v.severity === "all" ? undefined : v.severity,
        owner: v.owner === "all" ? undefined : v.owner,
        reporter: v.reporter === "all" ? undefined : v.reporter,
    });

    const {
        blockers,
        analytics,
        isLoading,
        patchBlockerLocal,
        removeBlockerLocal,
        refetchAnalytics,
    } = useBlockersList(activeSprintId, toApiFilters(filterValues));

    const { users } = useUsersList();

    const stats = useMemo(() => computeBlockerStats(blockers, analytics), [blockers, analytics]);

    const formDialog = useBlockerForm({
        sprintId: activeSprintId,
        onSaved: (b) => { patchBlockerLocal(b); refetchAnalytics(); },
    });

    const detailDialog = useBlockerDetail({
        onPatch: patchBlockerLocal,
        onDelete: removeBlockerLocal,
        refetchAnalytics,
    });

    const onFilterChange = (key: keyof BlockersFiltersValuesInterface, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const onFilterClear = () => setFilterValues(blockersConstants.defaults.filters);

    return {
        permissions,
        activeSprintId,
        compact,
        blockers,
        stats,
        isLoading,
        users,
        filters: { values: filterValues, onChange: onFilterChange, onClear: onFilterClear },
        formDialog,
        detailDialog,
    };
};
