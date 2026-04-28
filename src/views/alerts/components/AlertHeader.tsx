import { Bell, Check, Clock, ExternalLink, Link2, ShieldCheck } from "lucide-react";

import { t } from "@/hooks";
import type { AlertCardHeaderPropsInterface, AlertType } from "@/interfaces";

const renderTypeIcon = (type?: AlertType) => {
    if (type === "auto_alarm") return <Clock className="h-3.5 w-3.5 text-warning shrink-0" aria-label={t("Auto deadline alarm")} />;
    if (type === "dependency_resolved") return <Link2 className="h-3.5 w-3.5 text-success shrink-0" aria-label={t("Dependency resolved")} />;
    if (type === "task_completion_review") return <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label={t("Task completion review")} />;
    if (type === "requirements_approved") return <Check className="h-3.5 w-3.5 text-success shrink-0" aria-label={t("Requirements approved")} />;
    return <Bell className="h-3.5 w-3.5 text-text-muted shrink-0" />;
};

export const AlertHeader = ({ type, title, body, sourceTask, onOpenTask }: AlertCardHeaderPropsInterface) => (
    <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-dark flex items-center gap-1.5">
            {renderTypeIcon(type)}
            <span className="truncate">{title}</span>
        </h3>
        {body && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{body}</p>}
        {sourceTask && (
            <button
                type="button"
                onClick={() => onOpenTask(sourceTask.id)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
            >
                <ExternalLink className="h-3 w-3" />
                {sourceTask.code ?? sourceTask.title}
            </button>
        )}
    </div>
);
