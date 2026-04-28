import { EntityCard } from "@/components/shared";
import type { SprintsGridPropsInterface } from "@/interfaces";

import { SprintActions } from "./SprintActions";
import { SprintDateRange } from "./SprintDateRange";
import { SprintHeader } from "./SprintHeader";

export const SprintsGrid = ({ sprints, permissions, onEdit, onDelete, onActivate }: SprintsGridPropsInterface) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.map((sprint) => (
            <EntityCard key={sprint.id} contentClassName="p-5 space-y-3">
                <EntityCard.Row className="gap-2">
                    <SprintHeader sprint={sprint} />
                    <SprintActions
                        isActive={sprint.status === "active"}
                        permissions={permissions}
                        onEdit={() => onEdit(sprint)}
                        onDelete={() => onDelete(sprint)}
                        onActivate={() => onActivate(sprint)}
                    />
                </EntityCard.Row>
                <SprintDateRange startDate={sprint.start_date} endDate={sprint.end_date} />
            </EntityCard>
        ))}
    </div>
);
