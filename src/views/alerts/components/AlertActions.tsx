import { Pencil, Trash2 } from "lucide-react";

import type { AlertCardActionsPanelPropsInterface } from "@/interfaces";

export const AlertActions = ({ canEdit, canDelete, onEdit, onDelete }: AlertCardActionsPanelPropsInterface) => (
    <div className="flex items-center gap-1 shrink-0">
        {canEdit && (
            <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer"
            >
                <Pencil className="h-3.5 w-3.5" />
            </button>
        )}
        {canDelete && (
            <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        )}
    </div>
);
