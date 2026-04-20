import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, Filter, GitBranch, Layers, MessageSquare, PenTool, Plus, Shield, ShieldAlert, Users } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { BlockersSkeleton } from "@/components/skeletons";
import { BlockersProvider, useBlockers } from "@/contexts";
import { BlockerImpact, BlockerStatus, BlockerType } from "@/enums";
import { t, useSettings, usePageLoader } from "@/hooks";
import type { BlockerInterface, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";
import { BlockerDetailDialog } from "./BlockerDetailDialog";
import { BlockerFormDialog } from "./BlockerFormDialog";

const blockerTypeConfig: Record<BlockerType, { labelKey: string; icon: typeof AlertTriangle; color: string }> = {
    [BlockerType.Requirements]: { labelKey: "Requirements", icon: AlertTriangle, color: "bg-friction-requirements text-friction-requirements" },
    [BlockerType.ApiDependency]: { labelKey: "API Dependency", icon: GitBranch, color: "bg-friction-dependencies text-friction-dependencies" },
    [BlockerType.Design]: { labelKey: "Design", icon: PenTool, color: "bg-primary-lighter text-primary-medium" },
    [BlockerType.QAHandoff]: { labelKey: "QA Handoff", icon: Layers, color: "bg-friction-process text-friction-process" },
    [BlockerType.Communication]: { labelKey: "Communication", icon: MessageSquare, color: "bg-friction-communication text-friction-communication" },
    [BlockerType.Technical]: { labelKey: "Technical", icon: Shield, color: "bg-friction-team text-friction-team" },
};

const blockerStatusConfig: Record<BlockerStatus, { labelKey: string; variant: "error" | "success" | "warning" }> = {
    [BlockerStatus.Active]: { labelKey: "Active", variant: "error" },
    [BlockerStatus.Resolved]: { labelKey: "Resolved", variant: "success" },
    [BlockerStatus.Escalated]: { labelKey: "Escalated", variant: "warning" },
};

const impactConfig: Record<BlockerImpact, { labelKey: string; variant: "error" | "warning" | "secondary" | "outline" }> = {
    [BlockerImpact.Critical]: { labelKey: "Critical", variant: "error" },
    [BlockerImpact.High]: { labelKey: "High", variant: "warning" },
    [BlockerImpact.Medium]: { labelKey: "Medium", variant: "secondary" },
    [BlockerImpact.Low]: { labelKey: "Low", variant: "outline" },
};

const barColors: Record<BlockerType, string> = {
    [BlockerType.Requirements]: "bg-friction-requirements",
    [BlockerType.ApiDependency]: "bg-friction-dependencies",
    [BlockerType.Design]: "bg-primary",
    [BlockerType.QAHandoff]: "bg-friction-process",
    [BlockerType.Communication]: "bg-friction-communication",
    [BlockerType.Technical]: "bg-friction-team",
};

export const BlockerView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <BlockersProvider sprintId={activeSprintId}>
            <BlockerViewInner />
        </BlockersProvider>
    );
};

const BlockerViewInner = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();
    const { blockers, analytics, isLoading: isFetching } = useBlockers();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<BlockerInterface | null>(null);
    const [detailTarget, setDetailTarget] = useState<BlockerInterface | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    const filteredBlockers = useMemo(() => {
        let result = blockers;
        if (statusFilter !== "all") result = result.filter((b) => b.status === statusFilter);
        if (typeFilter !== "all") result = result.filter((b) => b.type === typeFilter);
        return result;
    }, [blockers, statusFilter, typeFilter]);

    const getMember = (id: string) => members.find((m) => m.id === id);

    const stats = useMemo(() => {
        if (analytics) {
            return {
                total: analytics.total,
                active: analytics.active,
                resolved: analytics.resolved,
                avgDuration: Math.round(analytics.avg_duration ?? 0),
            };
        }
        const active = blockers.filter((b) => b.status === BlockerStatus.Active || b.status === BlockerStatus.Escalated).length;
        const resolved = blockers.filter((b) => b.status === BlockerStatus.Resolved).length;
        const avgDuration = blockers.length > 0 ? Math.round(blockers.reduce((sum, b) => sum + b.durationDays, 0) / blockers.length) : 0;
        return { total: blockers.length, active, resolved, avgDuration };
    }, [analytics, blockers]);

    const impactByType = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const bt of Object.values(BlockerType)) counts[bt] = 0;
        if (analytics?.by_type) {
            for (const [k, v] of Object.entries(analytics.by_type)) counts[k] = v;
        } else {
            for (const b of blockers) counts[b.type] = (counts[b.type] ?? 0) + 1;
        }
        const max = Math.max(...Object.values(counts), 1);
        return { counts, max };
    }, [analytics, blockers]);

    if (pageLoading || isFetching) return <BlockersSkeleton />;

    return (
        <div>
            <Header
                title={t("Blocker Tracker")}
                description={t("Track and manage blockers affecting sprint delivery")}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px] sm:w-[150px] h-9 text-xs sm:text-sm">
                                <SelectValue placeholder={t("Status")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                <SelectItem value={BlockerStatus.Active}>{t("Active")}</SelectItem>
                                <SelectItem value={BlockerStatus.Resolved}>{t("Resolved")}</SelectItem>
                                <SelectItem value={BlockerStatus.Escalated}>{t("Escalated")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[130px] sm:w-[170px] h-9 text-xs sm:text-sm">
                                <SelectValue placeholder={t("Type")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Types")}</SelectItem>
                                {Object.values(BlockerType).map((bt) => (
                                    <SelectItem key={bt} value={bt}>{t(blockerTypeConfig[bt].labelKey)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                            <Plus className="h-4 w-4" />
                            {t("Add Blocker")}
                        </Button>
                    </div>
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

            <div className={cn("grid grid-cols-1 lg:grid-cols-3", compact ? "gap-3" : "gap-6")}>
                {/* Blocker List */}
                <div className={cn("lg:col-span-2 flex flex-col", compact ? "gap-2" : "gap-4")}>
                    <h2 className="text-lg font-semibold text-text-dark">
                        {t("Blockers")}
                        <Badge className="ms-2" variant="secondary">{filteredBlockers.length}</Badge>
                    </h2>

                    {filteredBlockers.length === 0 ? (
                        <EmptyState icon={ShieldAlert} title={t("No blockers found")} description={t("No blockers match the current filters")} />
                    ) : (
                        filteredBlockers.map((blocker) => {
                            const typeInfo = blockerTypeConfig[blocker.type];
                            const statusInfo = blockerStatusConfig[blocker.status];
                            const impactInfo = impactConfig[blocker.impact];
                            const reporter = getMember(blocker.reporterId);
                            const owner = getMember(blocker.ownerId);
                            const TypeIcon = typeInfo.icon;

                            return (
                                <Card
                                    key={blocker.id}
                                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => { setDetailTarget(blocker); setDetailOpen(true); }}
                                >
                                    <CardContent className={compact ? "p-3" : "p-5"}>
                                        {/* Header: title + badges */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", typeInfo.color.split(" ")[0])}>
                                                    <TypeIcon className={cn("h-4 w-4", typeInfo.color.split(" ")[1])} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-text-dark truncate">{blocker.title}</h3>
                                                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{blocker.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Badge variant={statusInfo.variant}>{t(statusInfo.labelKey)}</Badge>
                                                <Badge variant={impactInfo.variant}>{t(impactInfo.labelKey)}</Badge>
                                            </div>
                                        </div>

                                        {/* Meta row */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-text-muted">
                                            {/* Reporter */}
                                            <div className="flex items-center gap-1.5">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[8px]">{reporter?.avatar_initials}</AvatarFallback>
                                                </Avatar>
                                                <span>{t("Reported by")} <span className="font-medium text-text-secondary">{reporter?.full_name ?? t("Unknown")}</span></span>
                                            </div>

                                            {/* Owner */}
                                            <div className="flex items-center gap-1.5">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[8px]">{owner?.avatar_initials}</AvatarFallback>
                                                </Avatar>
                                                <span>{t("Owned by")} <span className="font-medium text-text-secondary">{owner?.full_name ?? t("Unassigned")}</span></span>
                                            </div>

                                            {/* Duration */}
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{blocker.durationDays} {t("days")}</span>
                                            </div>

                                            {/* Created */}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(blocker.createdAt)}</span>
                                            </div>

                                            {/* Affected tasks */}
                                            <div className="flex items-center gap-1">
                                                <Layers className="h-3 w-3" />
                                                <span>{blocker.taskIds.length} {t("tasks affected")}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Impact by Type Bar Chart */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4 text-primary" />
                                {t("Blocker Impact by Type")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {Object.values(BlockerType).map((type) => {
                                const count = impactByType.counts[type];
                                const widthPercent = impactByType.max > 0 ? (count / impactByType.max) * 100 : 0;
                                const config = blockerTypeConfig[type];
                                const TypeIcon = config.icon;

                                return (
                                    <div key={type}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <TypeIcon className={cn("h-3.5 w-3.5", config.color.split(" ")[1])} />
                                                <span className="text-xs font-medium text-text-secondary">{t(config.labelKey)}</span>
                                            </div>
                                            <span className="text-xs font-bold text-text-dark">{count}</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-500 progress-animated", barColors[type])}
                                                style={{ width: `${widthPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <BlockerFormDialog
                open={addOpen || !!editTarget}
                onOpenChange={(open) => {
                    if (!open) { setAddOpen(false); setEditTarget(null); }
                }}
                sprintId={activeSprintId}
                initial={editTarget}
            />

            <BlockerDetailDialog
                blocker={detailTarget}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onEdit={(b) => { setDetailOpen(false); setEditTarget(b); }}
            />
        </div>
    );
};
