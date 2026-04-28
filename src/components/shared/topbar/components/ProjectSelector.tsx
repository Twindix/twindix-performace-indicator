import { FolderKanban } from "lucide-react";

import { t } from "@/hooks";
import type { ProjectSelectorPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const ProjectSelector = ({ projects, value, onChange }: ProjectSelectorPropsInterface) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[130px] sm:w-[180px] h-9 text-xs sm:text-sm">
            <SelectValue placeholder={t("Select Project")} />
        </SelectTrigger>
        <SelectContent>
            {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-1.5">
                        <FolderKanban className="h-3 w-3 text-primary shrink-0" />
                        {p.name}
                    </span>
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
