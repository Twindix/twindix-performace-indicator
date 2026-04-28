import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { ViewModeTogglePropsInterface } from "@/interfaces";

export const ViewModeToggle = ({ value, onChange }: ViewModeTogglePropsInterface) => (
    <div className="flex items-center bg-muted p-1 rounded-lg ml-auto">
        <Button
            variant={value === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange("board")}
            className="h-7 text-xs px-3"
        >
            {t("Kanban")}
        </Button>
        <Button
            variant={value === "pipeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange("pipeline")}
            className="h-7 text-xs px-3"
        >
            {t("Pipeline")}
        </Button>
    </div>
);
