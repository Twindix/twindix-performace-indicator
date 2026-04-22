import { create } from "zustand";

import { seedProjects } from "@/data/seed";
import type {
    CreateProjectPayloadInterface,
    ProjectInterface,
    UpdateProjectPayloadInterface,
} from "@/interfaces/projects";

interface ProjectStore {
    projects: ProjectInterface[];
    activeProjectId: string;
    onSetActiveProject: (id: string) => void;
    createProject: (payload: CreateProjectPayloadInterface) => ProjectInterface;
    updateProject: (id: string, payload: UpdateProjectPayloadInterface) => void;
    deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    projects: seedProjects,
    activeProjectId: seedProjects[0]?.id ?? "",
    onSetActiveProject: (id) => set({ activeProjectId: id }),
    createProject: (payload) => {
        const project: ProjectInterface = {
            id: `prj-${Date.now()}`,
            name: payload.name,
            description: payload.description,
            start_date: payload.start_date,
            end_date: payload.end_date,
            status: payload.status ?? "planning",
            sprints_count: 0,
            members_count: 0,
        };
        set((state) => ({ projects: [...state.projects, project] }));
        return project;
    },
    updateProject: (id, payload) =>
        set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? { ...p, ...payload } : p)),
        })),
    deleteProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            activeProjectId: state.activeProjectId === id
                ? state.projects.find((p) => p.id !== id)?.id ?? ""
                : state.activeProjectId,
        })),
}));
