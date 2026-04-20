import { useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, Clock, Edit, Layers, ShieldAlert, Trash2, TrendingUp, User } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { t, useDeleteBlocker, useEscalateBlocker, useGetBlocker, useResolveBlocker } from "@/hooks";
import type { BlockerInterface } from "@/interfaces";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { cn, formatDate } from "@/utils";

interface Props {
    blocker: BlockerInterface | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (blocker: BlockerInterface) => void;
    onPatch: (blocker: BlockerInterface) => void;
    onRemove: (id: string) => void;
    refetchAnalytics: () => void;
}

const statusVariant = (status: string | null): "error" | "success" | "warning" | "secondary" => {
    if (status === "resolved") return "success";
    if (status === "escalated") return "warning";
    if (status === "active") return "error";
    return "secondary";
};

export const BlockerDetailDialog = ({ blocker, open, onOpenChange, onEdit, onPatch, onRemove, refetchAnalytics }: Props) => {
    const { getHandler: getBlockerHandler } = useGetBlocker();
    const { resolveHandler: resolveBlockerHandler, isLoading: isResolving } = useResolveBlocker();
    const { escalateHandler: escalateBlockerHandler, isLoading: isEscalating } = useEscalateBlocker();
    const { deleteHandler: deleteBlockerHandler, isLoading: isDeleting } = useDeleteBlocker();
    const [current, setCurrent] = useState<BlockerInterface | null>(blocker);

    useEffect(() => { setCurrent(blocker); }, [blocker]);

    useEffect(() => {
        if (!open || !blocker) return;
        getBlockerHandler(blocker.id).then((res) => {
            if (res) {
                setCurrent(res);
                onPatch(res);
            }
        });
    }, [open, blocker?.id, getBlockerHandler, onPatch]);

    if (!current) return null;

    const reporter = current.reporter;
    const owner = current.owner;
    const isResolved = current.status === "resolved";
    const isEscalated = current.status === "escalated";

    const handleResolve = async () => {
        const res = await resolveBlockerHandler(current.id);
        if (res) {
            setCurrent(res);
            onPatch(res);
            refetchAnalytics();
        }
    };

    const handleEscalate = async () => {
        const res = await escalateBlockerHandler(current.id);
        if (res) {
            setCurrent(res);
            onPatch(res);
            refetchAnalytics();
        }
    };

    const handleDelete = async () => {
        const ok = await deleteBlockerHandler(current.id);
        if (ok) {
            onRemove(current.id);
            refetchAnalytics();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        {current.status && (
                            <Badge variant={statusVariant(current.status)}>
                                {t(current.status.charAt(0).toUpperCase() + current.status.slice(1))}
                            </Badge>
                        )}
                        <Badge variant="outline">{t(current.type)}</Badge>
                        <Badge variant="secondary">{t(current.severity.charAt(0).toUpperCase() + current.severity.slice(1))}</Badge>
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
                    {reporter && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-text-muted" />
                            <div>
                                <p className="text-xs text-text-muted">{t("Reported by")}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{reporter.avatar_initials}</AvatarFallback></Avatar>
                                    <span className="text-sm font-medium text-text-dark">{reporter.full_name}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {owner && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-text-muted" />
                            <div>
                                <p className="text-xs text-text-muted">{t("Owned by")}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{owner.avatar_initials}</AvatarFallback></Avatar>
                                    <span className="text-sm font-medium text-text-dark">{owner.full_name}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Created")}</p>
                            <p className="text-sm font-medium text-text-dark">{formatDate(current.created_at)}</p>
                        </div>
                    </div>
                    {current.duration_days !== null && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-text-muted" />
                            <div>
                                <p className="text-xs text-text-muted">{t("Duration")}</p>
                                <p className="text-sm font-medium text-text-dark">{current.duration_days} {t("days")}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Linked tasks */}
                <div className="mt-4 pb-4 border-b border-border">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <Layers className="h-3.5 w-3.5" />
                        {t("Linked Tasks")} ({current.tasks.length})
                    </p>
                    {current.tasks.length === 0 ? (
                        <p className="text-xs text-text-muted italic">{t("No tasks linked")}</p>
                    ) : (
                        <div className="space-y-1.5">
                            {current.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                                    <span className="text-sm text-text-dark truncate">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                    {!isResolved ? (
                        <>
                            <Button onClick={handleResolve} disabled={isResolving} className="gap-1.5">
                                <CheckCircle2 className={cn("h-4 w-4", isResolving && "animate-spin")} />
                                {isResolving ? t("Resolving...") : t("Mark as Resolved")}
                            </Button>
                            {!isEscalated && (
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
                                {current.resolved_at && <> · {formatDate(current.resolved_at)}</>}
                            </span>
                        </div>
                    )}
                    {isEscalated && (
                        <Badge variant="warning" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {t("Escalated")}
                        </Badge>
                    )}
                    <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="ms-auto gap-1.5 border-error text-error hover:bg-error-light">
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? t("Deleting...") : t("Delete")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
