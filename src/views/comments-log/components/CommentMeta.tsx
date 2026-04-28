import { AtSign, CheckCircle2, Clock, User } from "lucide-react";

import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { CommentCardMetaPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDate, formatDateTime } from "@/utils";

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
