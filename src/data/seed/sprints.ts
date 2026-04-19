import { SprintStatus } from "@/enums";
import type { SprintInterface } from "@/interfaces";

export const seedSprints: SprintInterface[] = [
    {
        id: "spr-012",
        name: "Sprint 12",
        start_date: "2026-02-23",
        end_date: "2026-03-06",
        status: SprintStatus.Completed,
    },
    {
        id: "spr-013",
        name: "Sprint 13",
        start_date: "2026-03-09",
        end_date: "2026-03-20",
        status: SprintStatus.Completed,
    },
    {
        id: "spr-014",
        name: "Sprint 14",
        start_date: "2026-03-23",
        end_date: "2026-04-03",
        status: SprintStatus.Active,
    },
];
