import { Card, CardContent } from "@/atoms";
import type { SprintCardPropsInterface } from "@/interfaces";

import { SprintCardActions } from "./SprintCardActions";
import { SprintCardDateRange } from "./SprintCardDateRange";
import { SprintCardHeader } from "./SprintCardHeader";

export const SprintCard = ({ sprint, permissions, onEdit, onDelete, onActivate }: SprintCardPropsInterface) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <SprintCardHeader sprint={sprint} />
                <SprintCardActions
                    isActive={sprint.status === "active"}
                    permissions={permissions}
                    onEdit={() => onEdit(sprint)}
                    onDelete={() => onDelete(sprint)}
                    onActivate={() => onActivate(sprint)}
                />
            </div>
            <SprintCardDateRange startDate={sprint.start_date} endDate={sprint.end_date} />
        </CardContent>
    </Card>
);
