import { Calendar } from "lucide-react";

import type { ProjectCardMetaPropsInterface } from "@/interfaces";

export const ProjectCardMeta = ({ description, startDate, endDate }: ProjectCardMetaPropsInterface) => (
    <>
        {description && (
            <p className="text-xs text-text-muted line-clamp-2 mb-3">{description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {startDate ?? "—"} → {endDate ?? "—"}
            </span>
        </div>
    </>
);
