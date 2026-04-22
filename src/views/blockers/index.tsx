import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, Filter, GitBranch, Layers, MessageSquare, PenTool, Plus, Shield, ShieldAlert } from "lucide-react";

import { Badge, Button, Card, CardContent } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { BlockersSkeleton } from "@/components/skeletons";
import { BlockerType } from "@/enums";
import { t, useBlockersList, useSettings, usePageLoader, useUsersList } from "@/hooks";
import type { BlockerInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn, formatDate } from "@/utils";
import { BlockerDetailDialog } from "./BlockerDetailDialog";
import { BlockerFormDialog } from "./BlockerFormDialog";

const blockerTypeConfig: Record<string, { labelKey: string; icon: typeof AlertTriangle; color: string }> = {
    [BlockerType.Requirements]: { labelKey: "Requirements", icon: AlertTriangle, color: "bg-friction-requirements text-friction-requirements" },
    [BlockerType.ApiDependency]: { labelKey: "API Dependency", icon: GitBranch, color: "bg-friction-dependencies text-friction-dependencies" },
    [BlockerType.Design]: { labelKey: "Design", icon: PenTool, color: "bg-primary-lighter text-primary-medium" },
    [BlockerType.QAHandoff]: { labelKey: "QA Handoff", icon: Layers, color: "bg-friction-process text-friction-process" },
    [BlockerType.Communication]: { labelKey: "Communication", icon: MessageSquare, color: "bg-friction-communication text-friction-communication" },
    [BlockerType.Technical]: { labelKey: "Technical", icon: Shield, color: "bg-friction-team text-friction-team" },
};

const statusVariant = (status: string | null): "error" | "success" | "warning" | "secondary" => {
    if (status === "resolved") return "success";
    if (status === "escalated") return "warning";
    if (status === "active") return "error";
    return "secondary";
};

const severityVariant: Record<string, "error" | "warning" | "secondary" | "outline"> = {
    critical: "error",
    high: "warning",
    medium: "secondary",
    low: "outline",
};

export const BlockerView = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [severityFilter, setSeverityFilter] = useState<string>("all");
    const [ownerFilter, setOwnerFilter] = useState<string>("all");
    const [reporterFilter, setReporterFilter] = useState<string>("all");

    const { blockers, analytics, isLoading: isFetching, patchBlockerLocal, removeBlockerLocal, refetchAnalytics } = useBlockersList(activeSprintId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        severity: severityFilter === "all" ? undefined : severityFilter,
        owner: ownerFilter === "all" ? undefined : ownerFilter,
        reporter: reporterFilter === "all" ? undefined : reporterFilter,
    });
    const { users } = useUsersList();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<BlockerInterface | null>(null);
    const [detailTarget, setDetailTarget] = useState<BlockerInterface | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const stats = useMemo(() => {
        if (analytics) {
            return {
                total: analytics.total,
                active: analytics.active,
                resolved: analytics.resolved,
                avgDuration: Math.round(analytics.avg_duration_days ?? 0),
            };
        }
        const active = blockers.filter((b) => b.status === "active" || b.status === "escalated").length;
        const resolved = blockers.filter((b) => b.status === "resolved").length;
        const durations = blockers.map((b) => Number(b.duration_days ?? 0));
        const avgDuration = durations.length ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length) : 0;
        return { total: blockers.length, active, resolved, avgDuration };
    }, [analytics, blockers]);

    if (pageLoading || isFetching) return <BlockersSkeleton />;

    return (
        <div>
            <Header
                title={t("Blocker Tracker")}
                description={t("Track and manage blockers affecting sprint delivery")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t("Add Blocker")}
                    </Button>
                }
            />

            {/* Stats Row */}
            <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-3 mb-6")}>
                <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p>
                        <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Total Blockers")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-error"><AnimatedNumber value={stats.active} /></p>
                        <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Active")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-success"><AnimatedNumber value={stats.resolved} /></p>
                        <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Resolved")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-text-dark"><AnimatedNumber value={stats.avgDuration} suffix="d" /></p>
                        <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Avg Duration")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className={compact ? "mb-3" : "mb-6"}>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder={t("Status")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                <SelectItem value="active">{t("Active")}</SelectItem>
                                <SelectItem value="resolved">{t("Resolved")}</SelectItem>
                                <SelectItem value="escalated">{t("Escalated")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder={t("Type")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Types")}</SelectItem>
                                {Object.values(BlockerType).map((bt) => (
                                    <SelectItem key={bt} value={bt}>{t(blockerTypeConfig[bt]?.labelKey ?? bt)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder={t("Severity")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Severities")}</SelectItem>
                                <SelectItem value="critical">{t("Critical")}</SelectItem>
                                <SelectItem value="high">{t("High")}</SelectItem>
                                <SelectItem value="medium">{t("Medium")}</SelectItem>
                                <SelectItem value="low">{t("Low")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder={t("Owner")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Owners")}</SelectItem>
                                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={reporterFilter} onValueChange={setReporterFilter}>
                            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder={t("Reporter")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Reporters")}</SelectItem>
                                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {(statusFilter !== "all" || typeFilter !== "all" || severityFilter !== "all" || ownerFilter !== "all" || reporterFilter !== "all") && (
                            <button
                                onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setSeverityFilter("all"); setOwnerFilter("all"); setReporterFilter("all"); }}
                                className="text-xs text-text-muted hover:text-text-dark underline"
                            >
                                {t("Clear filters")}
                            </button>
                        )}
                        <span className="ms-auto text-xs text-text-muted">{blockers.length} {t("blockers")}</span>
                    </div>
                </CardContent>
            </Card>

            <div>
                <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
                    <h2 className="text-lg font-semibold text-text-dark">
                        {t("Blockers")}
                        <Badge className="ms-2" variant="secondary">{blockers.length}</Badge>
                    </h2>

                    {blockers.length === 0 ? (
                        <EmptyState icon={ShieldAlert} title={t("No blockers found")} description={t("No blockers match the current filters")} />
                    ) : (
                        blockers.map((blocker) => {
                            const typeInfo = blockerTypeConfig[blocker.type] ?? { labelKey: blocker.type, icon: AlertTriangle, color: "bg-muted text-text-muted" };
                            const TypeIcon = typeInfo.icon;
                            const sevVariant = severityVariant[blocker.severity] ?? "secondary";
                            const reporter = blocker.reporter;
                            const owner = blocker.owner;

                            return (
                                <Card
                                    key={blocker.id}
                                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => { setDetailTarget(blocker); setDetailOpen(true); }}
                                >
                                    <CardContent className={compact ? "p-3" : "p-5"}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", typeInfo.color.split(" ")[0])}>
                                                    <TypeIcon className={cn("h-4 w-4", typeInfo.color.split(" ")[1])} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-text-dark truncate">{blocker.title}</h3>
                                                    {blocker.description && (
                                                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{blocker.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {blocker.status && <Badge variant={statusVariant(blocker.status)}>{t(blocker.status.charAt(0).toUpperCase() + blocker.status.slice(1))}</Badge>}
                                                <Badge variant={sevVariant}>{t(blocker.severity.charAt(0).toUpperCase() + blocker.severity.slice(1))}</Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-text-muted">
                                            {reporter && (
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[8px]">{reporter.avatar_initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{t("Reported by")} <span className="font-medium text-text-secondary">{reporter.full_name}</span></span>
                                                </div>
                                            )}
                                            {owner && (
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[8px]">{owner.avatar_initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{t("Owned by")} <span className="font-medium text-text-secondary">{owner.full_name}</span></span>
                                                </div>
                                            )}
                                            {blocker.duration_days !== null && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{blocker.duration_days} {t("days")}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(blocker.created_at)}</span>
                                            </div>
                                            {Number(blocker.tasks_affected ?? 0) > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Layers className="h-3 w-3" />
                                                    <span>{blocker.tasks_affected} {t("tasks affected")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            <BlockerFormDialog
                open={addOpen || !!editTarget}
                onOpenChange={(open) => {
                    if (!open) { setAddOpen(false); setEditTarget(null); }
                }}
                sprintId={activeSprintId}
                initial={editTarget}
                users={users}
                onSaved={(b) => { patchBlockerLocal(b); refetchAnalytics(); }}
            />

            <BlockerDetailDialog
                blocker={detailTarget}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onEdit={(b) => { setDetailOpen(false); setEditTarget(b); }}
                onPatch={patchBlockerLocal}
                onDelete={removeBlockerLocal}
                refetchAnalytics={refetchAnalytics}
            />
        </div>
    );
};
