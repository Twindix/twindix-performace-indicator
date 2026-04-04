import { SprintStatus } from "@/enums";
import type { SprintInterface } from "@/interfaces";

export const seedSprints: SprintInterface[] = [
    {
        id: "spr-012",
        name: "Sprint 12",
        startDate: "2026-02-23",
        endDate: "2026-03-06",
        status: SprintStatus.Completed,
        healthScore: 58,
        goals: ["Complete user authentication redesign", "Fix critical payment bugs", "Implement dashboard v1"],
    },
    {
        id: "spr-013",
        name: "Sprint 13",
        startDate: "2026-03-09",
        endDate: "2026-03-20",
        status: SprintStatus.Completed,
        healthScore: 72,
        goals: ["Launch notification system", "Improve API response times", "Onboard new QA process"],
    },
    {
        id: "spr-014",
        name: "Sprint 14",
        startDate: "2026-03-23",
        endDate: "2026-04-03",
        status: SprintStatus.Active,
        healthScore: 67,
        goals: ["Complete settings page redesign", "Implement report export", "Resolve cross-team API dependencies"],
    },
];
