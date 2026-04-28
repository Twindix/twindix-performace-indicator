import type { SprintCardHeaderPropsInterface } from "@/interfaces";

import { SprintStatusBadge } from "./SprintStatusBadge";

export const SprintCardHeader = ({ sprint }: SprintCardHeaderPropsInterface) => (
    <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text-dark truncate">{sprint.name}</h3>
        <div className="mt-1">
            <SprintStatusBadge status={sprint.status} />
        </div>
    </div>
);
