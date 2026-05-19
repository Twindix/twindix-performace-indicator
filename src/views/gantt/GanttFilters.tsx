import { X } from "lucide-react";

import { Button, Label } from "@/atoms";
import { GanttStatus } from "@/enums";
import { t } from "@/hooks";
import type { GanttFiltersInterface } from "@/interfaces/gantt";
import type { ProjectLiteInterface } from "@/interfaces/projects";
import type { SprintInterface } from "@/interfaces/sprints";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

import { GANTT_STATUS_LABEL } from "./constants";

interface GanttFiltersProps {
    filters: GanttFiltersInterface;
    sprints: SprintInterface[];
    projects: ProjectLiteInterface[];
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

export const GanttFilters = ({ filters, sprints, projects, onChange, onReset, canReset }: GanttFiltersProps) => (
    <div className="flex flex-wrap items-end gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <div className="space-y-1.5">
            <Label>{t("View By")}</Label>
            <div className="flex gap-1.5">
                {(["sprint", "project"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => onChange({ mode: m, entityId: "" })}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            filters.mode === m
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-text-muted hover:bg-muted/80"
                        }`}
                    >
                        {m === "sprint" ? t("Sprint") : t("Project")}
                    </button>
                ))}
            </div>
        </div>

        {filters.mode === "sprint" ? (
            <div className="space-y-1.5 min-w-[200px]">
                <Label htmlFor="gantt-sprint">{t("Sprint")}</Label>
                <Select
                    value={filters.entityId || "none"}
                    onValueChange={(v) => onChange({ entityId: v === "none" ? "" : v })}
                >
                    <SelectTrigger id="gantt-sprint">
                        <SelectValue placeholder={t("Select sprint")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t("Select sprint")}</SelectItem>
                        {sprints.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        ) : (
            <div className="space-y-1.5 min-w-[200px]">
                <Label htmlFor="gantt-project">{t("Project")}</Label>
                <Select
                    value={filters.entityId || "none"}
                    onValueChange={(v) => onChange({ entityId: v === "none" ? "" : v })}
                >
                    <SelectTrigger id="gantt-project">
                        <SelectValue placeholder={t("Select project")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t("Select project")}</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}

        <div className="space-y-1.5 min-w-[160px]">
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

        <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!canReset}
            className="gap-1.5"
        >
            <X className="h-4 w-4" />
            {t("Reset")}
        </Button>
    </div>
);
