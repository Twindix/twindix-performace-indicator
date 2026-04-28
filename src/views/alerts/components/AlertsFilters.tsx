import { alertsConstants } from "@/constants";
import { t } from "@/hooks";
import type { AlertsFiltersPropsInterface } from "@/interfaces";

export const AlertsFilters = ({ value, onChange }: AlertsFiltersPropsInterface) => (
    <div className="flex flex-wrap gap-2 mb-4">
        {alertsConstants.filters.typeChips.map((chip) => (
            <button
                key={chip.value || "all"}
                type="button"
                onClick={() => onChange(chip.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${value === chip.value ? "bg-primary text-primary-foreground border-primary" : "bg-surface text-text-muted border-border hover:bg-muted"}`}
            >
                {t(chip.label)}
            </button>
        ))}
    </div>
);
