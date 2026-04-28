import { EntityCard } from "@/components/shared";
import type { ProjectsGridPropsInterface } from "@/interfaces";
import { getProjectCounts } from "@/lib/projects";

import { ProjectActions } from "./ProjectActions";
import { ProjectFooter } from "./ProjectFooter";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectMeta } from "./ProjectMeta";

export const ProjectsGrid = ({ projects, permissions, onOpen, onEdit, onDelete }: ProjectsGridPropsInterface) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
            <EntityCard key={project.id} contentClassName="p-5">
                <EntityCard.Row className="mb-3">
                    <ProjectHeader project={project} onOpen={() => onOpen(project)} />
                    <ProjectActions
                        canEdit={permissions.canEdit}
                        canDelete={permissions.canDelete}
                        onEdit={() => onEdit(project)}
                        onDelete={() => onDelete(project)}
                    />
                </EntityCard.Row>
                <ProjectMeta
                    description={project.description}
                    startDate={project.start_date}
                    endDate={project.end_date}
                />
                <ProjectFooter counts={getProjectCounts(project)} />
            </EntityCard>
        ))}
    </div>
);
