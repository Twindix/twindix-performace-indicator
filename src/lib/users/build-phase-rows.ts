import { usersConstants } from "@/constants";
import type { PhaseRowInterface, UserAnalyticsTasksByPhaseInterface } from "@/interfaces/users";

export const buildPhaseRows = (tasksByPhase: UserAnalyticsTasksByPhaseInterface): PhaseRowInterface[] =>
    (Object.keys(tasksByPhase) as (keyof UserAnalyticsTasksByPhaseInterface)[]).map((phase) => ({
        phase,
        count: tasksByPhase[phase],
        label: usersConstants.phaseLabels[phase] ?? phase,
    }));
