import type { MetricStatus, MetricTrend } from "@/enums";

export interface MetricInterface {
    id: string;
    name: string;
    value: number;
    unit: string;
    target: number;
    status: MetricStatus;
    trend: MetricTrend;
    trendPercent: number;
    category: string;
    sprintId: string;
    description: string;
}

export interface FrictionScoresInterface {
    poorRequirements: number;
    communicationGaps: number;
    weakOwnership: number;
    dependencyBlockers: number;
    processGaps: number;
    teamCulture: number;
}

export interface SprintMetricsInterface {
    sprintId: string;
    healthScore: number;
    frictionScores: FrictionScoresInterface;
    metrics: MetricInterface[];
}
