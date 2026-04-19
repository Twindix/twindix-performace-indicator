import { useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, Clock, Edit, Layers, ShieldAlert, User, X } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button } from "@/atoms";
import { blockersConstants } from "@/constants/blockers";
import { useBlockers } from "@/contexts";
import { BlockerImpact, BlockerStatus, BlockerType } from "@/enums";
import { t } from "@/hooks";
import type { BlockerInterface, TaskInterface, UserInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
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
    const { fetchBlockerDetail, resolveBlocker, unlinkTask } = useBlockers();
    const [current, setCurrent] = useState<BlockerInterface | null>(blocker);
    const [isResolving, setIsResolving] = useState(false);
    const [tasks, setTasks] = useState<TaskInterface[]>([]);

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    useEffect(() => { setCurrent(blocker); }, [blocker]);

    useEffect(() => {
        if (!open || !blocker) return;
        fetchBlockerDetail(blocker.id).then((res) => { if (res) setCurrent(res); });
    }, [open, blocker?.id, fetchBlockerDetail]);

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
        setIsResolving(true);
        const res = await resolveBlocker(current.id);
        setIsResolving(false);
        if (res) setCurrent(res);
    };

    const handleUnlink = async (taskId: string) => {
        try {
            const res = await unlinkTask(current.id, taskId);
            if (res) setCurrent(res);
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.unlinkTaskFailed));
        }
    };

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
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {t("Linked Tasks")} ({(current.taskIds ?? []).length})
                    </p>
                    {(current.taskIds ?? []).length === 0 ? (
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
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                    {current.status !== BlockerStatus.Resolved ? (
                        <Button onClick={handleResolve} disabled={isResolving} className="gap-1.5">
                            <CheckCircle2 className={cn("h-4 w-4", isResolving && "animate-spin")} />
                            {isResolving ? t("Resolving...") : t("Mark as Resolved")}
                        </Button>
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
