import { CheckCheck } from "lucide-react";

import { EmptyState } from "@/components/shared";
import { t } from "@/hooks";
import type { DoneAlertsTabPropsInterface } from "@/interfaces";

export const DoneAlertsTab = ({ isEmpty, children }: DoneAlertsTabPropsInterface) =>
    isEmpty ? (
        <EmptyState icon={CheckCheck} title={t("No done alerts")} description="" />
    ) : (
        <div className="flex flex-col gap-3">{children}</div>
    );
