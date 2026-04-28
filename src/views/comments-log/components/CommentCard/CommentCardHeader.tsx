import { Pencil, Reply, Trash2 } from "lucide-react";

import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { CommentCardHeaderPropsInterface } from "@/interfaces";

export const CommentCardHeader = ({ taskTitle, hasResponse, actions }: CommentCardHeaderPropsInterface) => (
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
