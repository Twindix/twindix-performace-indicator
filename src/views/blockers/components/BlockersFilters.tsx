import { Filter } from "lucide-react";

import { Card, CardContent } from "@/atoms";
import { blockersConstants } from "@/constants";
import { t } from "@/hooks";
import type { BlockersFiltersPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

const isAnyApplied = (values: BlockersFiltersPropsInterface["values"]) =>
    values.status !== "all" ||
    values.type !== "all" ||
    values.severity !== "all" ||
    values.owner !== "all" ||
    values.reporter !== "all";

export const BlockersFilters = ({
    values,
    onChange,
    onClear,
    users,
    blockerCount,
    compact,
}: BlockersFiltersPropsInterface) => (
    <Card className={compact ? "mb-3" : "mb-6"}>
        <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-text-muted hidden sm:block" />

                <Select value={values.status} onValueChange={(v) => onChange("status", v)}>
                    <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder={t("Status")} /></SelectTrigger>
                    <SelectContent>
                        {blockersConstants.statusOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={values.type} onValueChange={(v) => onChange("type", v)}>
                    <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder={t("Type")} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Types")}</SelectItem>
                        {blockersConstants.typeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={values.severity} onValueChange={(v) => onChange("severity", v)}>
                    <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder={t("Severity")} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Severities")}</SelectItem>
                        {blockersConstants.severityOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={values.owner} onValueChange={(v) => onChange("owner", v)}>
                    <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder={t("Owner")} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Owners")}</SelectItem>
                        {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={values.reporter} onValueChange={(v) => onChange("reporter", v)}>
                    <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder={t("Reporter")} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Reporters")}</SelectItem>
                        {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                    </SelectContent>
                </Select>

                {isAnyApplied(values) && (
                    <button
                        onClick={onClear}
                        className="text-xs text-text-muted hover:text-text-dark underline"
                    >
                        {t("Clear filters")}
                    </button>
                )}
                <span className="ms-auto text-xs text-text-muted">{blockerCount} {t("blockers")}</span>
            </div>
        </CardContent>
    </Card>
);
