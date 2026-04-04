import { useState } from "react";
import { BookOpen, Calendar, Filter, Users } from "lucide-react";

import { Badge, Card, CardContent } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { DecisionCategory, DecisionStatus } from "@/enums";
import { t, useSettings } from "@/hooks";
import type { DecisionInterface, SprintMetricsInterface, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar,
    AvatarFallback,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui";
import { formatDate, getStorageItem, storageKeys } from "@/utils";

const statusVariant: Record<DecisionStatus, "success" | "warning" | "error" | "secondary"> = {
    [DecisionStatus.Approved]: "success",
    [DecisionStatus.Pending]: "warning",
    [DecisionStatus.Rejected]: "error",
    [DecisionStatus.Deferred]: "secondary",
};

const categoryLabels: Record<DecisionCategory, string> = {
    [DecisionCategory.Architecture]: "Architecture",
    [DecisionCategory.Process]: "Process",
    [DecisionCategory.Tooling]: "Tooling",
    [DecisionCategory.Requirement]: "Requirement",
    [DecisionCategory.Design]: "Design",
};

export const DecisionsView = () => {
    useSettings();
    const { activeSprintId } = useSprintStore();
    const allDecisions = getStorageItem<DecisionInterface[]>(storageKeys.decisions) ?? [];
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const allMetrics = getStorageItem<SprintMetricsInterface[]>(storageKeys.metrics) ?? [];
    const sprintMetrics = allMetrics.find((m) => m.sprintId === activeSprintId);

    const sprintDecisions = allDecisions.filter((d) => d.sprintId === activeSprintId);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const filteredDecisions = sprintDecisions.filter((d) => {
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
        return true;
    });

    const getMember = (id: string) => members.find((m) => m.id === id);

    const totalCount = sprintDecisions.length;
    const approvedCount = sprintDecisions.filter((d) => d.status === DecisionStatus.Approved).length;
    const pendingCount = sprintDecisions.filter((d) => d.status === DecisionStatus.Pending).length;

    const coverageMetric = sprintMetrics?.metrics.find((m) => m.name === "Decision Log Coverage");
    const coverageValue = coverageMetric ? coverageMetric.value : totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

    return (
        <div>
            <Header title={t("Decision Log")} description={t("Document and track important project decisions")} />

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-text-dark">{totalCount}</p>
                        <p className="text-xs text-text-muted">Total Decisions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-success">{approvedCount}</p>
                        <p className="text-xs text-text-muted">Approved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                        <p className="text-xs text-text-muted">Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{coverageValue}%</p>
                        <p className="text-xs text-text-muted">Decision Coverage</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
                <Filter className="h-4 w-4 text-text-muted" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(DecisionStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(DecisionCategory).map((c) => (
                            <SelectItem key={c} value={c}>
                                {categoryLabels[c]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Decision List */}
            {filteredDecisions.length === 0 ? (
                <EmptyState icon={BookOpen} title="No decisions found" description="No decisions match the selected filters for this sprint." />
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredDecisions.map((decision) => {
                        const owner = getMember(decision.ownerId);
                        return (
                            <Dialog key={decision.id}>
                                <DialogTrigger asChild>
                                    <Card className="cursor-pointer">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-text-dark mb-1">{decision.title}</h3>
                                                    <p className="text-xs text-text-secondary line-clamp-2">{decision.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge variant={statusVariant[decision.status]}>{decision.status}</Badge>
                                                    <Badge variant="outline">{categoryLabels[decision.category]}</Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                {/* Owner */}
                                                {owner && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarFallback className="text-[8px]">{owner.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{owner.name}</span>
                                                    </div>
                                                )}

                                                {/* Participants */}
                                                {decision.participants.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        <div className="flex -space-x-1.5">
                                                            {decision.participants.slice(0, 4).map((pId) => {
                                                                const p = getMember(pId);
                                                                return (
                                                                    <Avatar key={pId} className="h-5 w-5 border-2 border-card">
                                                                        <AvatarFallback className="text-[7px]">{p?.avatar ?? "?"}</AvatarFallback>
                                                                    </Avatar>
                                                                );
                                                            })}
                                                            {decision.participants.length > 4 && (
                                                                <span className="ml-1 text-text-muted">+{decision.participants.length - 4}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(decision.createdAt)}</span>
                                                </div>
                                                {decision.decidedAt && (
                                                    <span className="text-text-muted">Decided: {formatDate(decision.decidedAt)}</span>
                                                )}
                                            </div>

                                            {decision.outcome && (
                                                <div className="mt-3 rounded-lg bg-muted p-2.5">
                                                    <p className="text-xs text-text-secondary">
                                                        <span className="font-medium text-text-dark">Outcome: </span>
                                                        {decision.outcome}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>

                                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{decision.title}</DialogTitle>
                                        <DialogDescription>Decision details and context</DialogDescription>
                                    </DialogHeader>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={statusVariant[decision.status]}>{decision.status}</Badge>
                                        <Badge variant="outline">{categoryLabels[decision.category]}</Badge>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-text-dark mb-1">Description</h4>
                                            <p className="text-sm text-text-secondary">{decision.description}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-text-dark mb-1">Context</h4>
                                            <p className="text-sm text-text-secondary">{decision.context}</p>
                                        </div>

                                        {decision.outcome && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-text-dark mb-1">Outcome</h4>
                                                <p className="text-sm text-text-secondary">{decision.outcome}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-text-dark mb-1">Owner</h4>
                                                {owner && (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-[9px]">{owner.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm text-text-secondary">{owner.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-text-dark mb-1">Participants</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {decision.participants.map((pId) => {
                                                        const p = getMember(pId);
                                                        return (
                                                            <div key={pId} className="flex items-center gap-1.5">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarFallback className="text-[8px]">{p?.avatar ?? "?"}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs text-text-secondary">{p?.name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                            <div>
                                                <h4 className="text-xs font-medium text-text-muted">Created</h4>
                                                <p className="text-sm text-text-secondary">{formatDate(decision.createdAt)}</p>
                                            </div>
                                            {decision.decidedAt && (
                                                <div>
                                                    <h4 className="text-xs font-medium text-text-muted">Decided</h4>
                                                    <p className="text-sm text-text-secondary">{formatDate(decision.decidedAt)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
