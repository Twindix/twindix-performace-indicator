import { tasksConstants } from "@/constants";
import type { TaskPhase } from "@/enums";
import { capitalize } from "@/utils";

/** Human-readable label for a TaskPhase. Uses tasksConstants.columns as the single source of truth. */
export const phaseLabel = (phase: TaskPhase): string =>
    tasksConstants.columns.find((c) => c.phase === phase)?.label ?? capitalize(phase);
