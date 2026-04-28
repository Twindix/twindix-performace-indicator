import { Bell, Check, CheckCheck, Clock, ExternalLink, Link2, ShieldCheck } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { t } from "@/hooks";
import type {
    AlertCardFooterPropsInterface,
    AlertCardHeaderPropsInterface,
    AlertCardMentionsPropsInterface,
    AlertCardMetaPropsInterface,
    AlertType,
} from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDateTime } from "@/utils";

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

export const AlertMeta = ({ creator, target, createdAt }: AlertCardMetaPropsInterface) => (
    <div className="flex items-center gap-3 flex-wrap text-xs text-text-muted">
        {creator ? (
            <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">{creator.avatar_initials}</AvatarFallback>
                </Avatar>
                <span>{creator.full_name}</span>
            </div>
        ) : (
            <span className="italic">{t("System")}</span>
        )}
        <Badge variant="outline" className="text-[10px]">{target}</Badge>
        <span className="ml-auto">{formatDateTime(createdAt)}</span>
    </div>
);

export const AlertMentions = ({ users }: AlertCardMentionsPropsInterface) => {
    if (users.length === 0) return null;
    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {users.map((u) => (
                <span key={u.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-text-dark">
                    <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[8px]">{u.avatar_initials}</AvatarFallback>
                    </Avatar>
                    {u.full_name}
                </span>
            ))}
        </div>
    );
};

export const AlertFooter = ({ isReviewTitle, sourceTaskId, counts, permissions, busy, actions }: AlertCardFooterPropsInterface) => (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <span className="text-xs text-text-muted">
            {t("Acknowledged")}: {counts.acknowledged}/{counts.total}
        </span>
        <div className="flex gap-1.5 ml-auto">
            {isReviewTitle && permissions.goToTask && (
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => actions.onOpenTask(sourceTaskId)}>
                    <ExternalLink className="h-3 w-3" /> {t("Go to task")}
                </Button>
            )}
            {permissions.acknowledge && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={actions.onAcknowledge} loading={busy.acknowledge}>
                    {!busy.acknowledge && <Check className="h-3 w-3" />} {t("Acknowledge")}
                </Button>
            )}
            {permissions.markDone && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={actions.onMarkDone} loading={busy.markDone}>
                    {!busy.markDone && <CheckCheck className="h-3 w-3" />} {t("Done")}
                </Button>
            )}
        </div>
    </div>
);
