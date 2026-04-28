import { Card, CardContent } from "@/atoms";
import type { ProjectCardPropsInterface } from "@/interfaces";
import { getProjectCounts } from "@/lib/projects";

import { ProjectCardActions } from "./ProjectCardActions";
import { ProjectCardFooter } from "./ProjectCardFooter";
import { ProjectCardHeader } from "./ProjectCardHeader";
import { ProjectCardMeta } from "./ProjectCardMeta";

export const ProjectCard = ({ project, permissions, onOpen, onEdit, onDelete }: ProjectCardPropsInterface) => {
    const counts = getProjectCounts(project);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <ProjectCardHeader project={project} onOpen={() => onOpen(project)} />
                    <ProjectCardActions
                        canEdit={permissions.canEdit}
                        canDelete={permissions.canDelete}
                        onEdit={() => onEdit(project)}
                        onDelete={() => onDelete(project)}
                    />
                </div>

                <ProjectCardMeta
                    description={project.description}
                    startDate={project.start_date}
                    endDate={project.end_date}
                />

                <ProjectCardFooter counts={counts} />
            </CardContent>
        </Card>
    );
};
