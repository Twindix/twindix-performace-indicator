export type { Ctx } from "./helpers";
export { inRoles, isViewer, ownerOf } from "./helpers";

export { authPolicy } from "./auth.policy";
export { sprintsPolicy } from "./sprints.policy";
export { projectsPolicy } from "./projects.policy";
export { tasksPolicy } from "./tasks.policy";
export { commentsPolicy } from "./comments.policy";
export { blockersPolicy } from "./blockers.policy";
export { redFlagsPolicy } from "./red-flags.policy";
export { alertsPolicy } from "./alerts.policy";
export { decisionsPolicy } from "./decisions.policy";
export { usersPolicy } from "./users.policy";
export { teamsPolicy } from "./teams.policy";

import { authPolicy } from "./auth.policy";
import { sprintsPolicy } from "./sprints.policy";
import { projectsPolicy } from "./projects.policy";
import { tasksPolicy } from "./tasks.policy";
import { commentsPolicy } from "./comments.policy";
import { blockersPolicy } from "./blockers.policy";
import { redFlagsPolicy } from "./red-flags.policy";
import { alertsPolicy } from "./alerts.policy";
import { decisionsPolicy } from "./decisions.policy";
import { usersPolicy } from "./users.policy";
import { teamsPolicy } from "./teams.policy";

export const policies = {
    auth: authPolicy,
    sprints: sprintsPolicy,
    projects: projectsPolicy,
    tasks: tasksPolicy,
    comments: commentsPolicy,
    blockers: blockersPolicy,
    redFlags: redFlagsPolicy,
    alerts: alertsPolicy,
    decisions: decisionsPolicy,
    users: usersPolicy,
    teams: teamsPolicy,
} as const;
