import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { AlertCardMetaPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDateTime } from "@/utils";

export const AlertCardMeta = ({ creator, target, createdAt }: AlertCardMetaPropsInterface) => (
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
