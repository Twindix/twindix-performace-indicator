import { 
    AlertCircle, 
    ArrowLeft, 
    ArrowRight, 
    User, 
    Layers, 
    ClipboardList, 
    Circle, 
    Tag,
    CheckCircle2
} from "lucide-react";
import { Badge, Button } from "@/atoms";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    Checkbox,
    Avatar,
    AvatarFallback,
} from "@/ui";
import { cn, td, formatDate } from "@/utils";
import { t } from "@/hooks";
import { ScoreGauge } from "@/components/shared";
import { BlockerStatus } from "@/enums";
import type { TaskPhase } from "@/enums";
import type { TaskInterface, UserInterface, BlockerInterface } from "@/interfaces";
import { 
    PHASE_INDEX, 
    COLUMNS, 
    COLUMN_COLORS, 
    PRIORITY_VARIANT, 
    READINESS_LABELS, 
    capitalize, 
    phaseLabel 
} from "../../data/seed/constants";

interface TaskDetailDialogProps {
    task: TaskInterface | null;
    member: UserInterface | undefined;
    blocker: BlockerInterface | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
}

export const TaskDetailDialog = ({ 
    task, 
    member, 
    blocker, 
    open, 
    onOpenChange, 
    onMoveRequest, 
}: TaskDetailDialogProps) => {
    if (!task) return null;

    const currentIndex = PHASE_INDEX[task.phase];
    const prevPhase = currentIndex > 0 ? COLUMNS[currentIndex - 1].phase : null;
    const nextPhase = currentIndex < COLUMNS.length - 1 ? COLUMNS[currentIndex + 1].phase : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>{t(capitalize(task.priority))}</Badge>
                        {task.hasBlocker && (
                            <Badge variant="error"><AlertCircle className="h-3 w-3 me-1" />{t("Blocked")}</Badge>
                        )}
                    </div>
                    <DialogTitle className="text-xl">{task.title}</DialogTitle>
                    <DialogDescription>{task.description}</DialogDescription>
                </DialogHeader>

                {/* Phase navigation buttons */}
                <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-xl bg-muted">
                    {prevPhase
                        ? <Button variant="secondary" size="sm" onClick={() => { onOpenChange(false); onMoveRequest(task, prevPhase); }} className="gap-1.5">
                            <ArrowLeft className="h-3.5 w-3.5" />{t(COLUMNS[currentIndex - 1].label)}
                          </Button>
                        : <div />}

                    <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", COLUMN_COLORS[task.phase])} />
                        <span className="text-sm font-semibold text-text-dark">{t(phaseLabel(task.phase))}</span>
                    </div>

                    {nextPhase
                        ? <Button size="sm" onClick={() => { onOpenChange(false); onMoveRequest(task, nextPhase); }} className="gap-1.5">
                            {t(COLUMNS[currentIndex + 1].label)}<ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        : <Badge variant="success" className="px-3 py-1.5">{t("Completed")}</Badge>}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Assignee")}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{member?.avatar ?? "?"}</AvatarFallback></Avatar>
                                <span className="text-sm font-medium text-text-dark">{member?.name ?? t("Unassigned")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Story Points")}</p>
                            <p className="text-sm font-medium text-text-dark">{task.storyPoints}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Phase")}</p>
                            <p className="text-sm font-medium text-text-dark">{t(phaseLabel(task.phase))}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Created")}</p>
                            <p className="text-sm font-medium text-text-dark">{formatDate(task.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1"><Tag className="h-3 w-3" />{t("Tags")}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                    </div>
                )}

                {/* Readiness Gate Section */}
                <div className="mt-5 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-text-dark">{t("Readiness Gate Checklist")}</h4>
                        <ScoreGauge score={task.readinessScore} size="sm" label={t("Ready")} />
                    </div>
                    <div className="space-y-3">
                        {READINESS_LABELS.map(({ key, label }) => {
                            const checked = task.readinessChecklist[key];
                            return (
                                <label key={key} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-colors", checked ? "bg-success-light/50" : "bg-muted/50")}>
                                    <Checkbox checked={checked} disabled />
                                    <span className={cn("text-sm", checked ? "text-text-dark font-medium" : "text-text-secondary")}>{td(label)}</span>
                                    {checked && <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto" />}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Blocker info */}
                {task.hasBlocker && blocker && (
                    <div className="mt-4 rounded-xl bg-error-light p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-error" />
                            <h4 className="text-sm font-semibold text-error">{t("Blocker")}</h4>
                            <Badge variant={blocker.status === BlockerStatus.Escalated ? "error" : "warning"}>
                                {t(capitalize(blocker.status))}
                            </Badge>
                        </div>
                        <p className="text-sm font-medium text-text-dark">{blocker.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{blocker.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-text-muted">{t("Impact")}: <strong className="text-error">{t(capitalize(blocker.impact))}</strong></span>
                            <span className="text-xs text-text-muted">{t("Duration")}: <strong>{blocker.durationDays} {t("days")}</strong></span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
