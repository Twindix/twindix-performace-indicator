import { AtSign, CheckCircle2, Clock, Pencil, Reply, Trash2, User } from "lucide-react";

import { Badge } from "@/atoms";
import { EntityCard } from "@/components/shared";
import { t } from "@/hooks";
import type {
    CommentCardBodyPropsInterface,
    CommentCardHeaderPropsInterface,
    CommentCardMetaPropsInterface,
    CommentCardPropsInterface,
} from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDate, formatDateTime } from "@/utils";

export const CommentHeader = ({ taskTitle, hasResponse, actions }: CommentCardHeaderPropsInterface) => (
    <div className="flex items-center justify-between gap-2 mb-2">
        {taskTitle ? (
            <Badge variant="outline" className="text-xs font-normal">{taskTitle}</Badge>
        ) : <span />}
        <div className="flex items-center gap-1 shrink-0">
            {!hasResponse && actions.canRespond && (
                <button onClick={actions.onRespond} className="p-1.5 rounded hover:bg-success-light text-text-muted hover:text-success cursor-pointer" title={t("Respond")}>
                    <Reply className="h-3.5 w-3.5" />
                </button>
            )}
            {actions.canEdit && (
                <button onClick={actions.onEdit} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer" title={t("Edit")}>
                    <Pencil className="h-3.5 w-3.5" />
                </button>
            )}
            {actions.canDelete && (
                <button onClick={actions.onDelete} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer" title={t("Delete")}>
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    </div>
);

export const CommentBody = ({ body, onClick }: CommentCardBodyPropsInterface) => (
    <p className="text-sm text-text-dark mb-3 cursor-pointer" onClick={onClick}>{body}</p>
);

export const CommentMeta = ({ comment }: CommentCardMetaPropsInterface) => {
    const hasResponse = !!comment.responded_at;
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-text-muted" />
                <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">{comment.author.avatar_initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-text-secondary">{comment.author.full_name}</span>
            </div>
            {comment.mentioned_users.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <AtSign className="h-3.5 w-3.5 text-primary" />
                    {comment.mentioned_users.map((m) => (
                        <div key={m.id} className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px]">{m.avatar_initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-primary font-medium">{m.full_name}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-text-muted" />
                <span className="text-xs text-text-muted">{formatDateTime(comment.created_at)}</span>
            </div>
            {hasResponse ? (
                <div className="flex items-center gap-1.5 ms-auto">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs text-success font-medium">{t("Responded")}</span>
                    <span className="text-xs text-text-muted">· {formatDate(comment.responded_at!)}</span>
                </div>
            ) : (
                <Badge variant="warning" className="ms-auto text-xs">{t("No Response")}</Badge>
            )}
        </div>
    );
};

export const CommentCard = ({ comment, permissions, callbacks }: CommentCardPropsInterface) => (
    <EntityCard>
        <CommentHeader
            taskTitle={comment.task_title}
            hasResponse={!!comment.responded_at}
            actions={{
                canRespond: permissions.canRespond(comment),
                canEdit: permissions.canEdit(comment),
                canDelete: permissions.canDelete(comment),
                onRespond: () => callbacks.onRespond(comment.id),
                onEdit: () => callbacks.onEdit(comment),
                onDelete: () => callbacks.onDelete(comment),
            }}
        />
        <CommentBody body={comment.body} onClick={() => callbacks.onView(comment)} />
        <CommentMeta comment={comment} />
    </EntityCard>
);
