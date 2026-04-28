import type { ProjectsGridPropsInterface } from "@/interfaces";

import { ProjectCard } from "./ProjectCard";

export const ProjectsGrid = ({ projects, permissions, onOpen, onEdit, onDelete }: ProjectsGridPropsInterface) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
            <ProjectCard
                key={project.id}
                project={project}
                permissions={permissions}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ))}
    </div>
);
