import { Bell } from "lucide-react";

import { EmptyState, QueryBoundary } from "@/components/shared";
import { AlertsSkeleton } from "@/components/skeletons";
import { t } from "@/hooks";
import type { PendingAlertsTabPropsInterface } from "@/interfaces";

export const PendingAlertsTab = ({ isLoading, isEmpty, children }: PendingAlertsTabPropsInterface) => (
    <QueryBoundary
        isLoading={isLoading}
        skeleton={<AlertsSkeleton />}
        empty={isEmpty}
        emptyState={<EmptyState icon={Bell} title={t("No pending alerts")} description={t("All clear!")} />}
    >
        <div className="flex flex-col gap-3">{children}</div>
    </QueryBoundary>
);
