import { useState } from "react";
import { BookOpen, Calendar, Check, Filter, Plus, Users, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { DecisionsSkeleton } from "@/components/skeletons";
import { DecisionsProvider, useDecisions } from "@/contexts";
import { DecisionCategory, DecisionStatus, UserRole } from "@/enums";
import { t, useAuth, useCreateDecision, useDeleteDecision, useGetDecision, usePageLoader, useSettings, useUpdateDecision } from "@/hooks";
import type { DecisionInterface, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

const statusVariant: Record<DecisionStatus, "success" | "warning" | "error"> = {
    [DecisionStatus.Approved]: "success",
    [DecisionStatus.Pending]: "warning",
    [DecisionStatus.Rejected]: "error",
};

const categoryLabels: Record<DecisionCategory, string> = {
    [DecisionCategory.Process]: "Process",
    [DecisionCategory.Tooling]: "Tooling",
    [DecisionCategory.Requirement]: "Requirement",
    [DecisionCategory.Design]: "Design",
};

const PM_ROLES = [UserRole.ProjectManager, UserRole.CEO, UserRole.CTO];

export const DecisionsView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <DecisionsProvider sprintId={activeSprintId}>
            <DecisionsViewInner />
        </DecisionsProvider>
    );
};

const DecisionsViewInner = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();
    const { decisions, isLoading: isFetching, patchDecisionLocal, removeDecisionLocal } = useDecisions();
    const { createHandler: createDecisionHandler, isLoading: isSubmitting } = useCreateDecision();
    const { updateHandler: updateDecisionHandler } = useUpdateDecision();
    const { deleteHandler: deleteDecisionHandler } = useDeleteDecision();
    const { getHandler: getDecisionHandler, isLoading: isLoadingDetail } = useGetDecision();

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [addOpen, setAddOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [viewTarget, setViewTarget] = useState<DecisionInterface | null>(null);

    const isPM = user ? PM_ROLES.includes(user.role as UserRole) : false;

    const filteredDecisions = decisions.filter((d) => {
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
        return true;
    });

    const getMember = (id: string) => members.find((m) => m.id === id);

    const handleAdd = async () => {
        if (!title.trim()) { setError(t("Title is required")); return; }
        if (!activeSprintId) return;
        const res = await createDecisionHandler(activeSprintId, { title: title.trim(), status: DecisionStatus.Pending });
        if (res) {
            patchDecisionLocal(res);
            setTitle("");
            setError("");
            setAddOpen(false);
        }
    };

    const handleApprove = async (id: string) => {
        const res = await updateDecisionHandler(id, {
            status: DecisionStatus.Approved,
            decided_at: new Date().toISOString().split("T")[0],
        });
        if (res) {
            patchDecisionLocal(res);
            if (viewTarget?.id === id) setViewTarget(res);
        }
    };

    const handleReject = async (id: string) => {
        const res = await updateDecisionHandler(id, {
            status: DecisionStatus.Rejected,
            decided_at: new Date().toISOString().split("T")[0],
        });
        if (res) {
            patchDecisionLocal(res);
            if (viewTarget?.id === id) setViewTarget(res);
        }
    };

    const handleView = async (d: DecisionInterface) => {
        setViewTarget(d);
        const fresh = await getDecisionHandler(d.id);
        if (fresh) {
            patchDecisionLocal(fresh);
            setViewTarget(fresh);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await deleteDecisionHandler(id);
        if (ok) {
            removeDecisionLocal(id);
            setViewTarget(null);
        }
    };

    if (pageLoading || isFetching) return <DecisionsSkeleton />;

    const totalCount = decisions.length;
    const approvedCount = decisions.filter((d) => d.status === DecisionStatus.Approved).length;
    const pendingCount = decisions.filter((d) => d.status === DecisionStatus.Pending).length;
    const rejectedCount = decisions.filter((d) => d.status === DecisionStatus.Rejected).length;

    return (
        <div>
            <Header
                title={t("Decision Log")}
                description={t("Document and track important project decisions")}
                actions={
                    <Button onClick={() => { setTitle(""); setError(""); setAddOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("Add Decision")}
                    </Button>
                }
            />

            {/* Stats */}
            <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={totalCount} /></p>
                        <p className="text-xs text-text-muted">{t("Total Decisions")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-success"><AnimatedNumber value={approvedCount} /></p>
                        <p className="text-xs text-text-muted">{t("Approved")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-warning"><AnimatedNumber value={pendingCount} /></p>
                        <p className="text-xs text-text-muted">{t("Pending")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-error"><AnimatedNumber value={rejectedCount} /></p>
                        <p className="text-xs text-text-muted">{t("Rejected")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters + count */}
            <div className={cn("flex flex-wrap items-center justify-between", compact ? "gap-2 mb-3" : "gap-3 mb-6")}>
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder={t("Status")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("All Statuses")}</SelectItem>
                            {Object.values(DecisionStatus).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {t(s.charAt(0).toUpperCase() + s.slice(1))}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder={t("Category")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("All Categories")}</SelectItem>
                            {Object.values(DecisionCategory).map((c) => (
                                <SelectItem key={c} value={c}>
                                    {t(categoryLabels[c])}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(statusFilter !== "all" || categoryFilter !== "all") && (
                        <button
                            onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); }}
                            className="text-xs text-text-muted hover:text-text-dark flex items-center gap-1 cursor-pointer"
                        >
                            <X className="h-3 w-3" /> {t("Clear")}
                        </button>
                    )}
                </div>
                <span className="text-xs text-text-muted">
                    {filteredDecisions.length} / {decisions.length} {t("decisions")}
                </span>
            </div>

            {/* List */}
            {filteredDecisions.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title={t("No decisions found")}
                    description={t("No decisions match the selected filters")}
                />
            ) : (
                <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
                    {filteredDecisions.map((decision) => {
                        const owner = getMember(decision.ownerId);
                        const isPending = decision.status === DecisionStatus.Pending;

                        return (
                            <Card
                                key={decision.id}
                                className="cursor-pointer hover:border-primary/40 transition-colors"
                                onClick={() => handleView(decision)}
                            >
                                <CardContent className={compact ? "p-3" : "p-5"}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-text-dark mb-1">{decision.title}</h3>
                                            {decision.description && (
                                                <p className="text-xs text-text-secondary line-clamp-2">{decision.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant={statusVariant[decision.status]}>
                                                {t(decision.status.charAt(0).toUpperCase() + decision.status.slice(1))}
                                            </Badge>
                                            {decision.category && <Badge variant="outline">{t(categoryLabels[decision.category])}</Badge>}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                                        {owner && (
                                            <div className="flex items-center gap-1.5">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[8px]">{owner.avatar}</AvatarFallback>
                                                </Avatar>
                                                <span>{owner.name}</span>
                                            </div>
                                        )}
                                        {(decision.participants ?? []).length > 0 && (
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
                                                        <span className="ms-1">+{decision.participants.length - 4}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(decision.createdAt)}</span>
                                        </div>
                                        {decision.decidedAt && (
                                            <span>{t("Decided")}: {formatDate(decision.decidedAt)}</span>
                                        )}
                                    </div>

                                    {/* PM approve / reject actions */}
                                    {isPM && isPending && (
                                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-xs text-text-muted flex-1">{t("Awaiting PM approval")}</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-3 gap-1 text-xs border-error text-error hover:bg-error-light"
                                                onClick={() => handleReject(decision.id)}
                                            >
                                                <X className="h-3 w-3" /> {t("Reject")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 gap-1 text-xs"
                                                onClick={() => handleApprove(decision.id)}
                                            >
                                                <Check className="h-3 w-3" /> {t("Approve")}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Detail dialog */}
            <Dialog open={!!viewTarget} onOpenChange={(open) => { if (!open) setViewTarget(null); }}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    {viewTarget && (() => {
                        const owner = getMember(viewTarget.ownerId);
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle>{viewTarget.title}</DialogTitle>
                                    <DialogDescription>{t("Decision details")}</DialogDescription>
                                </DialogHeader>

                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={statusVariant[viewTarget.status]}>
                                        {t(viewTarget.status.charAt(0).toUpperCase() + viewTarget.status.slice(1))}
                                    </Badge>
                                    {viewTarget.category && <Badge variant="outline">{t(categoryLabels[viewTarget.category])}</Badge>}
                                    {isLoadingDetail && <span className="text-xs text-text-muted">{t("Refreshing...")}</span>}
                                </div>

                                {isPM && viewTarget.status === DecisionStatus.Pending && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 border-error text-error hover:bg-error-light"
                                            onClick={() => handleReject(viewTarget.id)}
                                        >
                                            <X className="h-3.5 w-3.5" /> {t("Reject")}
                                        </Button>
                                        <Button size="sm" className="gap-1" onClick={() => handleApprove(viewTarget.id)}>
                                            <Check className="h-3.5 w-3.5" /> {t("Approve")}
                                        </Button>
                                    </div>
                                )}

                                <div className="mt-4 space-y-4">
                                    {viewTarget.description && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Description")}</h4>
                                            <p className="text-sm text-text-secondary">{viewTarget.description}</p>
                                        </div>
                                    )}
                                    {viewTarget.outcome && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Outcome")}</h4>
                                            <p className="text-sm text-text-secondary">{viewTarget.outcome}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        {owner && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Owner")}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[9px]">{owner.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-text-secondary">{owner.name}</span>
                                                </div>
                                            </div>
                                        )}
                                        {(viewTarget.participants ?? []).length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Participants")}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewTarget.participants.map((pId) => {
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
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                        <div>
                                            <h4 className="text-xs font-medium text-text-muted">{t("Created")}</h4>
                                            <p className="text-sm text-text-secondary">{formatDate(viewTarget.createdAt)}</p>
                                        </div>
                                        {viewTarget.decidedAt && (
                                            <div>
                                                <h4 className="text-xs font-medium text-text-muted">{t("Decided")}</h4>
                                                <p className="text-sm text-text-secondary">{formatDate(viewTarget.decidedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                                    {isPM && (
                                        <Button variant="outline" onClick={() => handleDelete(viewTarget.id)} className="text-error border-error hover:bg-error-light">
                                            {t("Delete")}
                                        </Button>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Add Decision dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t("Add Decision")}</DialogTitle>
                        <DialogDescription>{t("New decisions are submitted as Pending and require PM approval.")}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="dec-title">{t("Title")} <span className="text-error">*</span></Label>
                            <Input
                                id="dec-title"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value); setError(""); }}
                                placeholder={t("e.g. Adopt React Query for data fetching")}
                            />
                            {error && <p className="text-xs text-error">{error}</p>}
                        </div>

                        <div className="rounded-lg bg-warning-light border border-warning/20 px-3 py-2">
                            <p className="text-xs text-warning font-medium">{t("Status will be set to Pending — a PM must approve before it takes effect.")}</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                            </DialogClose>
                            <Button onClick={handleAdd} disabled={isSubmitting || !title.trim()} className="gap-2">
                                <Plus className="h-4 w-4" />
                                {isSubmitting ? t("Submitting...") : t("Submit Decision")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
