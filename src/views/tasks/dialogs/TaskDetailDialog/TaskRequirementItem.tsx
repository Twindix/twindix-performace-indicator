import { Pencil, X } from "lucide-react";

import type { TaskRequirementItemPropsInterface } from "@/interfaces";
import { Checkbox } from "@/ui";
import { cn } from "@/utils";

export const TaskRequirementItem = ({
    req,
    canToggle,
    onToggle,
    onStartEdit,
    onDelete,
}: TaskRequirementItemPropsInterface) => (
    <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2 group", req.is_done ? "bg-success-light/50" : "bg-muted")}>
        <Checkbox
            id={`req-${req.id}`}
            checked={!!req.is_done}
            disabled={!canToggle}
            onCheckedChange={() => { if (canToggle) onToggle(); }}
        />
        <label
            htmlFor={`req-${req.id}`}
            className={cn(
                "text-sm flex-1",
                canToggle ? "cursor-pointer" : "",
                req.is_done ? "line-through text-text-muted" : "text-text-dark",
            )}
        >
            {req.content}
        </label>
        {canToggle && (
            <>
                <button
                    onClick={onStartEdit}
                    className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                    <Pencil className="h-3 w-3" />
                </button>
                <button
                    onClick={onDelete}
                    className="text-text-muted hover:text-error transition-colors cursor-pointer"
                >
                    <X className="h-3 w-3" />
                </button>
            </>
        )}
    </div>
);
