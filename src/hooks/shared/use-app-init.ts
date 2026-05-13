import { useEffect, useState } from "react";

import type { ProjectInterface, SprintInterface } from "@/interfaces";
import { projectsService } from "@/services";
import { useProjectStore, useSprintStore } from "@/store";

/**
 * Resolves the initial active project + sprint on app load.
 *
 *   • Prefers a persisted selection from localStorage (when still valid).
 *   • Otherwise iterates active projects in order and picks the first one
 *     that has at least one sprint. Falls back to the first active project
 *     when none of them have sprints.
 *   • Within the chosen project, picks the first active sprint.
 *
 * Returns { isReady } — `false` until the resolver finishes (use it to gate
 * the dashboard with a loader).
 */
export const useAppInit = () => {
    const [isReady, setIsReady] = useState(false);

    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const onSetActiveProject = useProjectStore((s) => s.onSetActiveProject);
    const activeSprintId = useSprintStore((s) => s.activeSprintId);
    const onSetActiveSprint = useSprintStore((s) => s.onSetActiveSprint);

    useEffect(() => {
        // Fast path: localStorage already has both — trust it and skip the resolver entirely.
        if (activeProjectId && activeSprintId) {
            setIsReady(true);
            return;
        }

        let cancelled = false;

        const resolve = async () => {
            try {
                // 1. Fetch active projects to scan.
                const res = await projectsService.listHandler({ page: 1, per_page: 100 });
                if (cancelled) return;
                const projects: ProjectInterface[] = res.data ?? [];
                const activeProjects = projects.filter((p) => p.status === "active");

                // 2. Pick a project: keep persisted (if still active), else first active with active sprints.
                let chosen: ProjectInterface | undefined;
                let sprintsForChosen: SprintInterface[] | undefined;

                if (activeProjectId) {
                    chosen = activeProjects.find((p) => p.id === activeProjectId);
                }

                if (!chosen && activeProjects.length > 0) {
                    const sprintsByProject = await Promise.all(
                        activeProjects.map((p) => projectsService.sprintsHandler(p.id).catch(() => [])),
                    );
                    if (cancelled) return;
                    // "Has sprints" means has at least one ACTIVE sprint — a project full of
                    // planned/completed sprints isn't a useful default.
                    const withActiveSprintsIdx = sprintsByProject.findIndex((arr) => arr.some((s) => s.status === "active"));
                    const idx = withActiveSprintsIdx >= 0 ? withActiveSprintsIdx : 0;
                    chosen = activeProjects[idx];
                    // Reuse the already-fetched sprints — saves one round-trip below.
                    sprintsForChosen = sprintsByProject[idx];
                }

                // 3. Apply chosen project + first active sprint inside it.
                if (chosen) {
                    if (chosen.id !== activeProjectId) onSetActiveProject(chosen.id);

                    // Only fetch sprints if we don't already have them from step 2.
                    const sprints = sprintsForChosen ?? (await projectsService.sprintsHandler(chosen.id).catch(() => []));
                    if (cancelled) return;
                    const activeSprints = sprints.filter((s) => s.status === "active");

                    if (activeSprintId && activeSprints.some((s) => s.id === activeSprintId)) {
                        // Persisted sprint still valid in this project — keep it.
                    } else if (activeSprints.length > 0) {
                        onSetActiveSprint(activeSprints[0].id);
                    } else if (activeSprintId) {
                        onSetActiveSprint("");
                    }
                } else {
                    if (activeProjectId) onSetActiveProject("");
                    if (activeSprintId) onSetActiveSprint("");
                }
            } finally {
                if (!cancelled) setIsReady(true);
            }
        };

        resolve();
        return () => {
            cancelled = true;
        };
        // Run once on mount; subsequent project/sprint changes are handled by topbar effects.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { isReady };
};
