import { Edit, Trash2 } from "lucide-react";

import { EntityCard } from "@/components/shared";
import { t } from "@/hooks";
import type { ProjectsGridPropsInterface } from "@/interfaces";
import { getProjectCounts } from "@/lib/projects";

import { ProjectFooter, ProjectHeader, ProjectMeta } from "./card";

export const ProjectsGrid = ({ projects, permissions, onOpen, onEdit, onDelete }: ProjectsGridPropsInterface) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
            <EntityCard key={project.id} contentClassName="p-5">
                <EntityCard.Row className="mb-3">
                    <ProjectHeader project={project} onOpen={() => onOpen(project)} />
                    <EntityCard.Menu items={[
                        ...(permissions.canEdit ? [{ label: t("Edit"), icon: Edit, onSelect: () => onEdit(project) }] : []),
                        ...(permissions.canDelete ? [{ label: t("Delete"), icon: Trash2, onSelect: () => onDelete(project), danger: true }] : []),
                    ]} />
                </EntityCard.Row>
                <ProjectMeta description={project.description} startDate={project.start_date} endDate={project.end_date} />
                <ProjectFooter counts={getProjectCounts(project)} />
            </EntityCard>
        ))}
    </div>
);
