import { X } from "lucide-react";

import { Button, Input, Label } from "@/atoms";
import { GanttStatus } from "@/enums";
import { t } from "@/hooks";
import type { GanttFiltersInterface, GanttProjectLiteInterface } from "@/interfaces/gantt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

import { GANTT_STATUS_LABEL } from "./constants";

interface GanttFiltersProps {
    projects: GanttProjectLiteInterface[];
    filters: GanttFiltersInterface;
    onChange: (patch: Partial<GanttFiltersInterface>) => void;
    onReset: () => void;
    canReset: boolean;
}

const STATUS_OPTIONS: (GanttStatus | "all")[] = [
    "all",
    GanttStatus.NotStarted,
    GanttStatus.InProgress,
    GanttStatus.Completed,
    GanttStatus.Delayed,
];

export const GanttFilters = ({ projects, filters, onChange, onReset, canReset }: GanttFiltersProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <div className="space-y-1.5">
            <Label htmlFor="gantt-project">{t("Project")}</Label>
            <Select
                value={filters.projectId}
                onValueChange={(value) => onChange({ projectId: value })}
            >
                <SelectTrigger id="gantt-project">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("All Projects")}</SelectItem>
                    {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-1.5">
            <Label htmlFor="gantt-status">{t("Status")}</Label>
            <Select
                value={filters.status}
                onValueChange={(value) => onChange({ status: value as GanttStatus | "all" })}
            >
                <SelectTrigger id="gantt-status">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                            {s === "all" ? t("All Statuses") : t(GANTT_STATUS_LABEL[s])}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-1.5">
            <Label htmlFor="gantt-start">{t("From")}</Label>
            <Input
                id="gantt-start"
                type="date"
                value={filters.rangeStart}
                onChange={(e) => onChange({ rangeStart: e.target.value })}
            />
        </div>

        <div className="space-y-1.5">
            <Label htmlFor="gantt-end">{t("To")}</Label>
            <Input
                id="gantt-end"
                type="date"
                value={filters.rangeEnd}
                onChange={(e) => onChange({ rangeEnd: e.target.value })}
            />
        </div>

        <div className="flex items-end">
            <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={!canReset}
                className="gap-1.5 w-full"
            >
                <X className="h-4 w-4" />
                {t("Reset Filters")}
            </Button>
        </div>
    </div>
);
