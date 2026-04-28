import type { SprintFormStateInterface, SprintInterface } from "@/interfaces";

export const buildSprintForm = (sprint: SprintInterface): SprintFormStateInterface => ({
    name: sprint.name,
    start_date: sprint.start_date,
    end_date: sprint.end_date,
});
