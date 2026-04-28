import { Filter, X } from "lucide-react";

import { decisionsConstants } from "@/constants";
import { DecisionCategory, DecisionStatus } from "@/enums";
import { t } from "@/hooks";
import type { DecisionsFiltersPropsInterface } from "@/interfaces/decisions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn } from "@/utils";

export const DecisionsFilters = ({ filters, count, compact, onFilterChange, onClear }: DecisionsFiltersPropsInterface) => {
    const hasActiveFilter = filters.status !== "all" || filters.category !== "all";

    return (
        <div className={cn("flex flex-wrap items-center justify-between", compact ? "gap-2 mb-3" : "gap-3 mb-6")}>
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                <Select
                    value={filters.status}
                    onValueChange={(v) => onFilterChange("status", v as DecisionStatus | "all")}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={t("Status")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Statuses")}</SelectItem>
                        {Object.values(DecisionStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                                {t(decisionsConstants.statusLabels[s])}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={filters.category}
                    onValueChange={(v) => onFilterChange("category", v as DecisionCategory | "all")}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t("Category")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Categories")}</SelectItem>
                        {Object.values(DecisionCategory).map((c) => (
                            <SelectItem key={c} value={c}>
                                {t(decisionsConstants.categoryLabels[c])}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActiveFilter && (
                    <button
                        onClick={onClear}
                        className="text-xs text-text-muted hover:text-text-dark flex items-center gap-1 cursor-pointer"
                    >
                        <X className="h-3 w-3" /> {t("Clear")}
                    </button>
                )}
            </div>
            <span className="text-xs text-text-muted">
                {count} {t("decisions")}
            </span>
        </div>
    );
};
