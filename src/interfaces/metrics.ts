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
    alertResponse: number;
    redFlagResponse: number;
    deliveryTime: number;
    commentsResponse: number;
    rejectionRate: number;
}

export interface SprintMetricsInterface {
    sprintId: string;
    healthScore: number;
    frictionScores: FrictionScoresInterface;
    metrics: MetricInterface[];
}
