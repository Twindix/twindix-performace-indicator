import { defaultSprintBadge, sprintBadgeByStatus } from "@/constants";
import type { SprintBadgeInterface } from "@/interfaces";

export const getSprintBadge = (status: string | null): SprintBadgeInterface =>
    (status && sprintBadgeByStatus[status]) || defaultSprintBadge;
