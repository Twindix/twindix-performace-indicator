import { ArrowLeft } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { OpenedProjectViewPropsInterface } from "@/interfaces";
import { SprintsView } from "@/views/sprints";

export const OpenedProjectView = ({ project, onBack }: OpenedProjectViewPropsInterface) => (
    <div>
        <div className="mb-4">
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Projects")}
            </Button>
            <p className="mt-3 text-xs text-text-muted">
                {t("Project")}: <span className="font-semibold text-text-dark">{project.name}</span>
            </p>
        </div>
        <SprintsView />
    </div>
);
