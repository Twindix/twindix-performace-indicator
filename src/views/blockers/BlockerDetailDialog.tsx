import { useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, Clock, Edit, Layers, Plus, ShieldAlert, TrendingUp, User, X } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { useBlockers } from "@/contexts";
import { BlockerImpact, BlockerStatus, BlockerType } from "@/enums";
import { t, useEscalateBlocker, useGetBlocker, useLinkBlockerTasks, useResolveBlocker, useUnlinkBlockerTask } from "@/hooks";
import type { BlockerInterface, TaskInterface, UserInterface } from "@/interfaces";
import { tasksService } from "@/services";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

interface Props {
    blocker: BlockerInterface | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (blocker: BlockerInterface) => void;
}

const TYPE_LABELS: Record<BlockerType, string> = {
    [BlockerType.Requirements]: "Requirements",
    [BlockerType.ApiDependency]: "API Dependency",
    [BlockerType.Design]: "Design",
    [BlockerType.QAHandoff]: "QA Handoff",
    [BlockerType.Communication]: "Communication",
    [BlockerType.Technical]: "Technical",
};

const SEVERITY_LABELS: Record<string, string> = {
    [BlockerImpact.Critical]: "Critical",
    [BlockerImpact.High]: "High",
    [BlockerImpact.Medium]: "Medium",
    [BlockerImpact.Low]: "Low",
};

const STATUS_VARIANTS: Record<BlockerStatus, "error" | "success" | "warning"> = {
    [BlockerStatus.Active]: "error",
    [BlockerStatus.Resolved]: "success",
    [BlockerStatus.Escalated]: "warning",
};

export const BlockerDetailDialog = ({ blocker, open, onOpenChange, onEdit }: Props) => {
    const { patchBlockerLocal, refetchAnalytics } = useBlockers();
    const { getHandler: getBlockerHandler } = useGetBlocker();
    const { resolveHandler: resolveBlockerHandler, isLoading: isResolving } = useResolveBlocker();
    const { escalateHandler: escalateBlockerHandler, isLoading: isEscalating } = useEscalateBlocker();
    const { linkHandler: linkBlockerTasksHandler } = useLinkBlockerTasks();
    const { unlinkHandler: unlinkBlockerTaskHandler } = useUnlinkBlockerTask();
    const [current, setCurrent] = useState<BlockerInterface | null>(blocker);
    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [showLinkUI, setShowLinkUI] = useState(false);
    const [linkSelection, setLinkSelection] = useState<string[]>([]);

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    useEffect(() => { setCurrent(blocker); }, [blocker]);

    useEffect(() => {
        if (!open || !blocker) return;
        getBlockerHandler(blocker.id).then((res) => {
            if (res) {
                setCurrent(res);
                patchBlockerLocal(res);
            }
        });
    }, [open, blocker?.id, getBlockerHandler, patchBlockerLocal]);

    useEffect(() => {
        if (!open || !current?.sprintId) return;
        tasksService.listHandler(current.sprintId)
            .then((res) => setTasks(res.data))
            .catch(() => setTasks([]));
    }, [open, current?.sprintId]);

    if (!current) return null;

    const reporter = members.find((m) => m.id === current.reporterId);
    const owner = members.find((m) => m.id === current.ownerId);
    const linkedTasks = (current.taskIds ?? []).map((id) => tasks.find((t) => t.id === id) ?? null);

    const handleResolve = async () => {
        const res = await resolveBlockerHandler(current.id);
        if (res) {
            setCurrent(res);
            patchBlockerLocal(res);
            refetchAnalytics();
        }
    };

    const handleEscalate = async () => {
        const res = await escalateBlockerHandler(current.id);
        if (res) {
            setCurrent(res);
            patchBlockerLocal(res);
            refetchAnalytics();
        }
    };

    const handleLinkMore = async () => {
        if (linkSelection.length === 0) return;
        const res = await linkBlockerTasksHandler(current.id, linkSelection);
        if (res) {
            setCurrent(res);
            patchBlockerLocal(res);
            setLinkSelection([]);
            setShowLinkUI(false);
        }
    };

    const handleUnlink = async (taskId: string) => {
        const ok = await unlinkBlockerTaskHandler(current.id, taskId);
        if (ok) {
            const next = { ...current, taskIds: (current.taskIds ?? []).filter((t) => t !== taskId) };
            setCurrent(next);
            patchBlockerLocal(next);
        }
    };

    const availableTasks = tasks.filter((t) => !(current.taskIds ?? []).includes(t.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        <Badge variant={STATUS_VARIANTS[current.status]}>{t(current.status)}</Badge>
                        <Badge variant="outline">{t(TYPE_LABELS[current.type])}</Badge>
                        {current.severity && <Badge variant="secondary">{t(SEVERITY_LABELS[current.severity] ?? current.severity)}</Badge>}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(current)}
                            className="ms-auto h-7 gap-1.5 text-xs me-8"
                        >
                            <Edit className="h-3.5 w-3.5" />
                            {t("Edit")}
                        </Button>
                    </div>
                    <DialogTitle className="text-xl">{current.title}</DialogTitle>
                    {current.description && <p className="text-sm text-text-secondary">{current.description}</p>}
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Reported by")}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{reporter?.avatar ?? "?"}</AvatarFallback></Avatar>
                                <span className="text-sm font-medium text-text-dark">{reporter?.name ?? t("Unknown")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Owned by")}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{owner?.avatar ?? "?"}</AvatarFallback></Avatar>
                                <span className="text-sm font-medium text-text-dark">{owner?.name ?? t("Unassigned")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Created")}</p>
                            <p className="text-sm font-medium text-text-dark">{formatDate(current.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Duration")}</p>
                            <p className="text-sm font-medium text-text-dark">{current.durationDays} {t("days")}</p>
                        </div>
                    </div>
                </div>

                {/* Linked tasks */}
                <div className="mt-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" />
                            {t("Linked Tasks")} ({(current.taskIds ?? []).length})
                        </p>
                        {!showLinkUI && availableTasks.length > 0 && (
                            <button onClick={() => setShowLinkUI(true)} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer">
                                <Plus className="h-3 w-3" /> {t("Link Tasks")}
                            </button>
                        )}
                    </div>
                    {(current.taskIds ?? []).length === 0 && !showLinkUI ? (
                        <p className="text-xs text-text-muted italic">{t("No tasks linked")}</p>
                    ) : (
                        <div className="space-y-1.5">
                            {linkedTasks.map((task, i) => {
                                const id = current.taskIds[i];
                                return (
                                    <div key={id} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 group">
                                        <span className="text-sm text-text-dark truncate">{task?.title ?? id}</span>
                                        <button
                                            onClick={() => handleUnlink(id)}
                                            className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            aria-label={t("Unlink task")}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {showLinkUI && (
                        <div className="mt-3 space-y-2">
                            <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1 bg-surface">
                                {availableTasks.map((tk) => {
                                    const checked = linkSelection.includes(tk.id);
                                    return (
                                        <label key={tk.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-muted">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    setLinkSelection((prev) => e.target.checked ? [...prev, tk.id] : prev.filter((i) => i !== tk.id));
                                                }}
                                            />
                                            <span className="text-xs text-text-dark truncate">{tk.title}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={handleLinkMore} disabled={linkSelection.length === 0}>
                                    {t("Link")} {linkSelection.length > 0 && `(${linkSelection.length})`}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setShowLinkUI(false); setLinkSelection([]); }}>{t("Cancel")}</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                    {current.status !== BlockerStatus.Resolved ? (
                        <>
                            <Button onClick={handleResolve} disabled={isResolving} className="gap-1.5">
                                <CheckCircle2 className={cn("h-4 w-4", isResolving && "animate-spin")} />
                                {isResolving ? t("Resolving...") : t("Mark as Resolved")}
                            </Button>
                            {current.status !== BlockerStatus.Escalated && (
                                <Button variant="outline" onClick={handleEscalate} disabled={isEscalating} className="gap-1.5 border-warning text-warning hover:bg-warning-light">
                                    <TrendingUp className="h-4 w-4" />
                                    {isEscalating ? t("Escalating...") : t("Escalate")}
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5 text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {t("Resolved")}
                                {current.resolvedAt && <> · {formatDate(current.resolvedAt)}</>}
                            </span>
                        </div>
                    )}
                    {current.status === BlockerStatus.Escalated && (
                        <Badge variant="warning" className="gap-1 ms-auto">
                            <AlertCircle className="h-3 w-3" />
                            {t("Escalated")}
                        </Badge>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
