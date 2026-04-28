import type { ProjectFormStateInterface, ProjectInterface } from "@/interfaces";

export const buildProjectForm = (project: ProjectInterface): ProjectFormStateInterface => ({
    name: project.name,
    description: project.description ?? "",
    start_date: project.start_date ?? "",
    end_date: project.end_date ?? "",
    status: project.status,
});
