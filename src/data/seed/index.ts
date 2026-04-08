import { storageKeys, getStorageItem, setStorageItem } from "@/utils";

import { seedTeamMembers } from "./team-members";
import { seedSprints } from "./sprints";
import { seedTasks } from "./tasks";
import { seedBlockers } from "./blockers";
import { seedDecisions } from "./decisions";
import { seedCommunications } from "./communications";
import { seedMetrics } from "./metrics";
import { seedWorkload } from "./workload";
import { seedOwnership } from "./ownership";
import { seedHandoffs } from "./handoffs";
import { seedRedFlags } from "./red-flags";

const SEED_VERSION = 6;

export const initializeSeedData = () => {
    const currentVersion = getStorageItem<number>(storageKeys.seeded);
    if (currentVersion === SEED_VERSION) return;

    setStorageItem(storageKeys.teamMembers, seedTeamMembers);
    setStorageItem(storageKeys.sprints, seedSprints);
    setStorageItem(storageKeys.tasks, seedTasks);
    setStorageItem(storageKeys.blockers, seedBlockers);
    setStorageItem(storageKeys.decisions, seedDecisions);
    setStorageItem(storageKeys.communications, seedCommunications);
    setStorageItem(storageKeys.metrics, seedMetrics);
    setStorageItem(storageKeys.workload, seedWorkload);
    setStorageItem(storageKeys.ownership, seedOwnership);
    setStorageItem(storageKeys.handoffs, seedHandoffs);
    setStorageItem(storageKeys.redFlags, seedRedFlags);
    setStorageItem(storageKeys.seeded, SEED_VERSION);
};

export { seedTeamMembers } from "./team-members";
export { seedSprints } from "./sprints";
export { seedTasks } from "./tasks";
export { seedBlockers } from "./blockers";
export { seedDecisions } from "./decisions";
export { seedCommunications } from "./communications";
export { seedMetrics } from "./metrics";
export { seedWorkload } from "./workload";
export { seedOwnership } from "./ownership";
export { seedHandoffs } from "./handoffs";
export { seedRedFlags } from "./red-flags";
