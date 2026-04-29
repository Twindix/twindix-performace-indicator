import { Edit, Trash2, Zap } from "lucide-react";

import { EntityCard } from "@/components/shared";
import { t } from "@/hooks";
import type { SprintsGridPropsInterface } from "@/interfaces";

import { SprintDateRange, SprintHeader } from "./card";

export const SprintsGrid = ({ sprints, permissions, onEdit, onDelete, onActivate }: SprintsGridPropsInterface) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.map((sprint) => (
            <EntityCard key={sprint.id} contentClassName="p-5 space-y-3">
                <EntityCard.Row className="gap-2">
                    <SprintHeader sprint={sprint} />
                    <EntityCard.Menu items={[
                        ...(sprint.status !== "active" && permissions.canActivate ? [{ label: t("Activate"), icon: Zap, onSelect: () => onActivate(sprint) }] : []),
                        ...(permissions.canEdit ? [{ label: t("Edit"), icon: Edit, onSelect: () => onEdit(sprint) }] : []),
                        ...(permissions.canDelete ? [{ label: t("Delete"), icon: Trash2, onSelect: () => onDelete(sprint), danger: true }] : []),
                    ]} />
                </EntityCard.Row>
                <SprintDateRange startDate={sprint.start_date} endDate={sprint.end_date} />
            </EntityCard>
        ))}
    </div>
);
