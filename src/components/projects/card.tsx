import { Calendar, FolderKanban, Users } from "lucide-react";

import { Badge } from "@/atoms";
import { projectStatusLabels, projectStatusVariants } from "@/constants";
import { t } from "@/hooks";
import type {
    ProjectCardFooterPropsInterface,
    ProjectCardHeaderPropsInterface,
    ProjectCardMetaPropsInterface,
} from "@/interfaces";

export const ProjectHeader = ({ project, onOpen }: ProjectCardHeaderPropsInterface) => (
    <button type="button" onClick={onOpen} className="flex items-start gap-3 text-start flex-1 min-w-0 cursor-pointer">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
            <FolderKanban className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-text-dark truncate">{project.name}</h3>
            <Badge variant={projectStatusVariants[project.status]} className="mt-1 text-[10px]">
                {t(projectStatusLabels[project.status])}
            </Badge>
        </div>
    </button>
);

export const ProjectMeta = ({ description, startDate, endDate }: ProjectCardMetaPropsInterface) => (
    <>
        {description && <p className="text-xs text-text-muted line-clamp-2 mb-3">{description}</p>}
        <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {startDate ?? "—"} → {endDate ?? "—"}
            </span>
        </div>
    </>
);

export const ProjectFooter = ({ counts }: ProjectCardFooterPropsInterface) => (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-text-muted">
        <span>{counts.sprintCount} {t("sprints")}</span>
        <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {counts.memberCount}
        </span>
    </div>
);
