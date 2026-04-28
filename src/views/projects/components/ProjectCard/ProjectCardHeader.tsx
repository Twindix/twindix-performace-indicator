import { FolderKanban } from "lucide-react";

import { Badge } from "@/atoms";
import { projectStatusLabels, projectStatusVariants } from "@/constants";
import { t } from "@/hooks";
import type { ProjectCardHeaderPropsInterface } from "@/interfaces";

export const ProjectCardHeader = ({ project, onOpen }: ProjectCardHeaderPropsInterface) => (
    <button
        type="button"
        onClick={onOpen}
        className="flex items-start gap-3 text-start flex-1 min-w-0 cursor-pointer"
    >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
            <FolderKanban className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-text-dark truncate">
                {project.name}
            </h3>
            <Badge variant={projectStatusVariants[project.status]} className="mt-1 text-[10px]">
                {t(projectStatusLabels[project.status])}
            </Badge>
        </div>
    </button>
);
