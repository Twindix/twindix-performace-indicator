import { Users } from "lucide-react";

import { t } from "@/hooks";
import type { ProjectCardFooterPropsInterface } from "@/interfaces";

export const ProjectCardFooter = ({ counts }: ProjectCardFooterPropsInterface) => (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-text-muted">
        <span>{counts.sprintCount} {t("sprints")}</span>
        <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {counts.memberCount}
        </span>
    </div>
);
