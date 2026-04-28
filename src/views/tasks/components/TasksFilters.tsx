import { Filter, Plus, Search } from "lucide-react";

import { Button, Card, CardContent, Input } from "@/atoms";
import { SelectField } from "@/components/shared";
import { tasksConstants } from "@/constants";
import { t } from "@/hooks";
import type { TasksFiltersPropsInterface } from "@/interfaces";

import { ViewModeToggle } from "./ViewModeToggle";

export const TasksFilters = ({
    search,
    filters,
    viewMode,
    users,
    canCreate,
    onCreate,
}: TasksFiltersPropsInterface) => {
    const isAnyApplied =
        filters.values.status !== "all" ||
        filters.values.assignee !== "all" ||
        filters.values.priority !== "all" ||
        filters.values.type !== "all" ||
        search.value.length > 0;

    const translateOptions = (opts: { value: string; label: string }[]) =>
        opts.map((o) => ({ value: o.value, label: t(o.label) }));

    const assigneeOptions = [
        { value: "all", label: t("All Assignees") },
        ...users.map((u) => ({ value: u.id, label: u.full_name })),
    ];

    return (
        <Card className="mb-6">
            <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
                        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                        <Input
                            placeholder={t("Search tasks or tags...")}
                            value={search.value}
                            onChange={(e) => search.onChange(e.target.value)}
                            style={{ paddingInlineStart: 40 }}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-text-muted hidden sm:block shrink-0" />

                        <SelectField
                            value={filters.values.status}
                            onChange={(v) => filters.onChange("status", v)}
                            options={translateOptions(tasksConstants.statusFilterOptions)}
                            placeholder={t("Status")}
                            triggerClassName="w-[150px] h-9 text-xs sm:text-sm"
                        />

                        <SelectField
                            value={filters.values.priority}
                            onChange={(v) => filters.onChange("priority", v)}
                            options={translateOptions(tasksConstants.priorityFilterOptions)}
                            placeholder={t("Priority")}
                            triggerClassName="w-[130px] h-9 text-xs sm:text-sm"
                        />

                        <SelectField
                            value={filters.values.assignee}
                            onChange={(v) => filters.onChange("assignee", v)}
                            options={assigneeOptions}
                            placeholder={t("Assignee")}
                            triggerClassName="w-[150px] h-9 text-xs sm:text-sm"
                        />

                        <SelectField
                            value={filters.values.type}
                            onChange={(v) => filters.onChange("type", v)}
                            options={translateOptions(tasksConstants.typeFilterOptions)}
                            placeholder={t("Type")}
                            triggerClassName="w-[120px] h-9 text-xs sm:text-sm"
                        />

                        {isAnyApplied && (
                            <button
                                onClick={filters.onClear}
                                className="text-xs text-text-muted hover:text-text-dark underline cursor-pointer"
                            >
                                {t("Clear all")}
                            </button>
                        )}

                        {canCreate && (
                            <Button size="sm" className="gap-1.5 shrink-0" onClick={onCreate}>
                                <Plus className="h-4 w-4" />
                                {t("Add Task")}
                            </Button>
                        )}
                    </div>

                    <ViewModeToggle value={viewMode.value} onChange={viewMode.onChange} />
                </div>
            </CardContent>
        </Card>
    );
};
