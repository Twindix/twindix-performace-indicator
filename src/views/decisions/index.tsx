import { useState } from "react";
import { BookOpen, Calendar, Check, Filter, Plus, Trash2, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { DecisionsSkeleton } from "@/components/skeletons";
import { DecisionCategory, DecisionStatus } from "@/enums";
import {
    t,
    useAuth,
    useCreateDecision,
    useDecisionsAnalytics,
    useDecisionsList,
    useDeleteDecision,
    useGetDecision,
    usePageLoader,
    useSettings,
    useUpdateDecision,
} from "@/hooks";
import type { DecisionInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar,
    AvatarFallback,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui";
import { cn, formatDate } from "@/utils";

const statusVariant: Record<DecisionStatus, "success" | "warning" | "error" | "secondary"> = {
    [DecisionStatus.Approved]: "success",
    [DecisionStatus.Pending]:  "warning",
    [DecisionStatus.Rejected]: "error",
    [DecisionStatus.Deferred]: "secondary",
};

const categoryLabels: Record<DecisionCategory, string> = {
    [DecisionCategory.Process]:     "Process",
    [DecisionCategory.Tooling]:     "Tooling",
    [DecisionCategory.Requirement]: "Requirement",
    [DecisionCategory.Design]:      "Design",
};

const emptyForm = { title: "", description: "", category: DecisionCategory.Process };

export const DecisionsView = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();
    const { user } = useAuth();

    const [statusFilter, setStatusFilter] = useState<DecisionStatus | "all">("all");
    const [categoryFilter, setCategoryFilter] = useState<DecisionCategory | "all">("all");

    const { decisions, isLoading: isFetching, patchDecisionLocal, removeDecisionLocal } = useDecisionsList(activeSprintId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
    });
    const { analytics, refetch: refetchAnalytics } = useDecisionsAnalytics(activeSprintId);
    const { createHandler: createDecisionHandler, isLoading: isSubmitting } = useCreateDecision();
    const { updateHandler: updateDecisionHandler } = useUpdateDecision();
    const { deleteHandler: deleteDecisionHandler } = useDeleteDecision();
    const { getHandler: getDecisionHandler, isLoading: isLoadingDetail } = useGetDecision();

    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

    const [viewTarget, setViewTarget] = useState<DecisionInterface | null>(null);

    const isPM = user?.role_tier === "manager";

    const validate = () => {
        const e: Partial<typeof emptyForm> = {};
        if (!form.title.trim()) e.title = t("Title is required");
        if (!form.description.trim()) e.description = t("Description is required");
        return e;
    };

    const handleAdd = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        if (!activeSprintId) return;

        const res = await createDecisionHandler(activeSprintId, {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            status: DecisionStatus.Pending,
        });
        if (res) {
            patchDecisionLocal(res);
            refetchAnalytics();
            setForm(emptyForm);
            setErrors({});
            setAddOpen(false);
        }
    };

    const handleSetStatus = async (id: string, status: DecisionStatus) => {
        const res = await updateDecisionHandler(id, {
            status,
            decided_at: new Date().toISOString().split("T")[0],
        });
        if (res) {
            patchDecisionLocal(res);
            refetchAnalytics();
            setViewTarget(null);
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
            refetchAnalytics();
            setViewTarget(null);
        }
    };

    if (pageLoading || isFetching) return <DecisionsSkeleton />;

    const totalCount = analytics?.total ?? decisions.length;
    const approvedCount = analytics?.approved ?? decisions.filter((d) => d.status === DecisionStatus.Approved).length;
    const pendingCount = analytics?.pending ?? decisions.filter((d) => d.status === DecisionStatus.Pending).length;
    const rejectedCount = analytics?.rejected ?? decisions.filter((d) => d.status === DecisionStatus.Rejected).length;

    return (
        <div>
            <Header
                title={t("Decision Log")}
                description={t("Document and track important project decisions")}
                actions={
                    <Button onClick={() => { setForm(emptyForm); setErrors({}); setAddOpen(true); }} className="gap-2">
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
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DecisionStatus | "all")}>
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
                    <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as DecisionCategory | "all")}>
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
                    {decisions.length} {t("decisions")}
                </span>
            </div>

            {/* List */}
            {decisions.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title={t("No decisions found")}
                    description={t("No decisions match the selected filters")}
                />
            ) : (
                <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
                    {decisions.map((decision) => {
                        const creator = decision.created_by;
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
                                            {decision.category && (
                                                <Badge variant="outline">{t(categoryLabels[decision.category])}</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                                        {creator && (
                                            <div className="flex items-center gap-1.5">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[8px]">{creator.avatar_initials}</AvatarFallback>
                                                </Avatar>
                                                <span>{creator.full_name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(decision.created_at)}</span>
                                        </div>
                                        {decision.decided_at && (
                                            <span>{t("Decided")}: {formatDate(decision.decided_at)}</span>
                                        )}
                                    </div>

                                    {decision.outcome && (
                                        <div className="mt-3 rounded-lg bg-muted p-2.5">
                                            <p className="text-xs text-text-secondary">
                                                <span className="font-medium text-text-dark">{t("Outcome")}: </span>
                                                {decision.outcome}
                                            </p>
                                        </div>
                                    )}

                                    {/* PM approve / reject actions */}
                                    {isPM && isPending && (
                                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-xs text-text-muted flex-1">{t("Awaiting PM approval")}</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-3 gap-1 text-xs border-error text-error hover:bg-error-light"
                                                onClick={() => handleSetStatus(decision.id, DecisionStatus.Rejected)}
                                            >
                                                <X className="h-3 w-3" /> {t("Reject")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 gap-1 text-xs"
                                                onClick={() => handleSetStatus(decision.id, DecisionStatus.Approved)}
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
                        const creator = viewTarget.created_by;
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
                                    {viewTarget.category && (
                                        <Badge variant="outline">{t(categoryLabels[viewTarget.category])}</Badge>
                                    )}
                                    {isLoadingDetail && <span className="text-xs text-text-muted">{t("Refreshing...")}</span>}
                                </div>

                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {viewTarget.status !== DecisionStatus.Approved && (
                                        <Button size="sm" className="gap-1" onClick={() => handleSetStatus(viewTarget.id, DecisionStatus.Approved)}>
                                            <Check className="h-3.5 w-3.5" /> {t("Approve")}
                                        </Button>
                                    )}
                                    {viewTarget.status !== DecisionStatus.Rejected && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 border-error text-error hover:bg-error-light"
                                            onClick={() => handleSetStatus(viewTarget.id, DecisionStatus.Rejected)}
                                        >
                                            <X className="h-3.5 w-3.5" /> {t("Reject")}
                                        </Button>
                                    )}
                                    {viewTarget.status !== DecisionStatus.Pending && (
                                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleSetStatus(viewTarget.id, DecisionStatus.Pending)}>
                                            {t("Set Pending")}
                                        </Button>
                                    )}
                                    {viewTarget.status !== DecisionStatus.Deferred && (
                                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleSetStatus(viewTarget.id, DecisionStatus.Deferred)}>
                                            {t("Defer")}
                                        </Button>
                                    )}
                                </div>

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
                                        {creator && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Raised by")}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[9px]">{creator.avatar_initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-text-secondary">{creator.full_name}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                        <div>
                                            <h4 className="text-xs font-medium text-text-muted">{t("Created")}</h4>
                                            <p className="text-sm text-text-secondary">{formatDate(viewTarget.created_at)}</p>
                                        </div>
                                        {viewTarget.decided_at && (
                                            <div>
                                                <h4 className="text-xs font-medium text-text-muted">{t("Decided")}</h4>
                                                <p className="text-sm text-text-secondary">{formatDate(viewTarget.decided_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isPM && (
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDelete(viewTarget.id)}
                                            className="gap-1 text-error border-error hover:bg-error-light"
                                        >
                                            <Trash2 className="h-4 w-4" /> {t("Delete")}
                                        </Button>
                                    </div>
                                )}
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
                            <Label htmlFor="dec-title">{t("Title")} *</Label>
                            <Input
                                id="dec-title"
                                value={form.title}
                                onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((er) => ({ ...er, title: undefined })); }}
                                placeholder={t("e.g. Adopt React Query for data fetching")}
                            />
                            {errors.title && <p className="text-xs text-error">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dec-description">{t("Description")} *</Label>
                            <Textarea
                                id="dec-description"
                                rows={3}
                                value={form.description}
                                onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setErrors((er) => ({ ...er, description: undefined })); }}
                                placeholder={t("What is this decision about?")}
                            />
                            {errors.description && <p className="text-xs text-error">{errors.description}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t("Category")}</Label>
                            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as DecisionCategory }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(DecisionCategory)
                                        .filter((c) => c !== DecisionCategory.Requirement)
                                        .map((c) => (
                                            <SelectItem key={c} value={c}>{t(categoryLabels[c])}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-lg bg-warning-light border border-warning/20 px-3 py-2">
                            <p className="text-xs text-warning font-medium">{t("Status will be set to Pending — a PM must approve before it takes effect.")}</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isSubmitting}>{t("Cancel")}</Button>
                            <Button onClick={handleAdd} disabled={isSubmitting} className="gap-2">
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
