import { AlertCircle } from "lucide-react";

import { Badge } from "@/atoms";
import { BlockerStatus } from "@/enums";
import { t } from "@/hooks";
import type { TaskBlockerSectionPropsInterface } from "@/interfaces";
import { capitalize } from "@/utils";

export const TaskBlockerSection = ({ blocker, isBlocked }: TaskBlockerSectionPropsInterface) => {
    if (!isBlocked || !blocker) return null;

    return (
        <div className="mt-4 pb-4 border-b border-border rounded-xl bg-error-light p-4">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-error" />
                <h4 className="text-sm font-semibold text-error">{t("Blocker")}</h4>
                <Badge variant={blocker.status === BlockerStatus.Escalated ? "error" : "warning"}>
                    {t(capitalize(blocker.status ?? ""))}
                </Badge>
            </div>
            <p className="text-sm font-medium text-text-dark">{blocker.title}</p>
            <p className="text-xs text-text-secondary mt-1">{blocker.description}</p>
        </div>
    );
};
