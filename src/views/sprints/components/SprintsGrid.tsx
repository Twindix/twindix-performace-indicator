import type { SprintsGridPropsInterface } from "@/interfaces";

import { SprintCard } from "./SprintCard";

export const SprintsGrid = ({ sprints, permissions, onEdit, onDelete, onActivate }: SprintsGridPropsInterface) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.map((sprint) => (
            <SprintCard
                key={sprint.id}
                sprint={sprint}
                permissions={permissions}
                onEdit={onEdit}
                onDelete={onDelete}
                onActivate={onActivate}
            />
        ))}
    </div>
);
