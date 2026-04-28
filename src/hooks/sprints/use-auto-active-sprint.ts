import { useEffect } from "react";

import type { UseAutoActiveSprintArgsInterface } from "@/interfaces";

export const useAutoActiveSprint = ({
    sprints,
    activeSprintId,
    onSetActive,
}: UseAutoActiveSprintArgsInterface) => {
    useEffect(() => {
        if (sprints.length === 0) return;
        if (activeSprintId && sprints.some((s) => s.id === activeSprintId)) return;
        const active = sprints.find((s) => s.status === "active") ?? sprints[0];
        if (active) onSetActive(active.id);
    }, [sprints, activeSprintId, onSetActive]);
};
