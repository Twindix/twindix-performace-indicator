import { Filter, Plus, Search } from "lucide-react";

import { Button, Card, CardContent, Input } from "@/atoms";
import { tasksConstants } from "@/constants";
import { t } from "@/hooks";
import type { TasksFiltersPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

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

                        <Select value={filters.values.status} onValueChange={(v) => filters.onChange("status", v)}>
                            <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm">
                                <SelectValue placeholder={t("Status")} />
                            </SelectTrigger>
                            <SelectContent>
                                {tasksConstants.statusFilterOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.values.priority} onValueChange={(v) => filters.onChange("priority", v)}>
                            <SelectTrigger className="w-[130px] h-9 text-xs sm:text-sm">
                                <SelectValue placeholder={t("Priority")} />
                            </SelectTrigger>
                            <SelectContent>
                                {tasksConstants.priorityFilterOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.values.assignee} onValueChange={(v) => filters.onChange("assignee", v)}>
                            <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm">
                                <SelectValue placeholder={t("Assignee")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Assignees")}</SelectItem>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.values.type} onValueChange={(v) => filters.onChange("type", v)}>
                            <SelectTrigger className="w-[120px] h-9 text-xs sm:text-sm">
                                <SelectValue placeholder={t("Type")} />
                            </SelectTrigger>
                            <SelectContent>
                                {tasksConstants.typeFilterOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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
