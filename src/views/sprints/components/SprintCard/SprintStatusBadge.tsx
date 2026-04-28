import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { SprintStatusBadgePropsInterface } from "@/interfaces";
import { getSprintBadge } from "@/lib/sprints";

export const SprintStatusBadge = ({ status }: SprintStatusBadgePropsInterface) => {
    const { label, variant } = getSprintBadge(status);
    return <Badge variant={variant}>{t(label)}</Badge>;
};
