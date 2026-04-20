import { storageKeys, getStorageItem, setStorageItem } from "@/utils";

import { seedTeamMembers } from "./team-members";
import { seedSprints } from "./sprints";
import { seedTasks } from "./tasks";
import { seedDecisions } from "./decisions";
import { seedCommunications } from "./communications";
import { seedMetrics } from "./metrics";
import { seedWorkload } from "./workload";
import { seedOwnership } from "./ownership";
import { seedHandoffs } from "./handoffs";
import { seedComments } from "./comments";
import { seedRedFlags } from "./red-flags";
import { seedAlerts } from "./alerts";

const SEED_VERSION = 8;

export const initializeSeedData = () => {
    const currentVersion = getStorageItem<number>(storageKeys.seeded);
    if (currentVersion === SEED_VERSION) return;

    setStorageItem(storageKeys.teamMembers, seedTeamMembers);
    setStorageItem(storageKeys.sprints, seedSprints);
    setStorageItem(storageKeys.tasks, seedTasks);
    setStorageItem(storageKeys.decisions, seedDecisions);
    setStorageItem(storageKeys.communications, seedCommunications);
    setStorageItem(storageKeys.metrics, seedMetrics);
    setStorageItem(storageKeys.workload, seedWorkload);
    setStorageItem(storageKeys.ownership, seedOwnership);
    setStorageItem(storageKeys.handoffs, seedHandoffs);
    setStorageItem(storageKeys.comments, seedComments);
    setStorageItem(storageKeys.redFlags, seedRedFlags);
    setStorageItem(storageKeys.alerts, seedAlerts);
    setStorageItem(storageKeys.seeded, SEED_VERSION);
};

export { seedTeamMembers } from "./team-members";
export { seedSprints } from "./sprints";
export { seedTasks } from "./tasks";
export { seedDecisions } from "./decisions";
export { seedCommunications } from "./communications";
export { seedMetrics } from "./metrics";
export { seedWorkload } from "./workload";
export { seedOwnership } from "./ownership";
export { seedHandoffs } from "./handoffs";
export { seedComments } from "./comments";
export { seedRedFlags } from "./red-flags";
export { seedAlerts } from "./alerts";
