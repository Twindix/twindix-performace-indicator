import { create } from "zustand";

import { seedDeploys } from "@/data/seed";
import type { DeployInterface } from "@/interfaces";

interface DeployStore {
    deploys: DeployInterface[];
    addDeploy: (deploy: DeployInterface) => void;
    removeDeploy: (id: string) => void;
}

export const useDeployStore = create<DeployStore>((set) => ({
    deploys: seedDeploys,
    addDeploy: (deploy) => set((s) => ({ deploys: [deploy, ...s.deploys] })),
    removeDeploy: (id) => set((s) => ({ deploys: s.deploys.filter((d) => d.id !== id) })),
}));
