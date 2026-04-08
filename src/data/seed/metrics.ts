import { MetricStatus, MetricTrend } from "@/enums";
import type { SprintMetricsInterface } from "@/interfaces";

const createMetric = (id: string, name: string, value: number, unit: string, target: number, status: MetricStatus, trend: MetricTrend, trendPercent: number, category: string, sprintId: string, description: string) => ({
    id, name, value, unit, target, status, trend, trendPercent, category, sprintId, description,
});

export const seedMetrics: SprintMetricsInterface[] = [
    {
        sprintId: "spr-012",
        healthScore: 42,
        frictionScores: { 
            alertResponse: 35, 
            redFlagResponse: 30, 
            deliveryTime: 25, 
            commentsResponse: 40, 
            rejectionRate: 35 
        },
        metrics: [
            createMetric("m-012-01", "Alert Response Time", 14.5, "hours", 2, MetricStatus.Critical, MetricTrend.Up, 20, "alertResponse", "spr-012", "Average time taken to acknowledge and respond to system alerts"),
            createMetric("m-012-02", "Red Flag Resolution", 3.2, "days", 1, MetricStatus.Critical, MetricTrend.Up, 15, "redFlagResponse", "spr-012", "Average time to resolve high-priority red flags identified during sprint"),
            createMetric("m-012-03", "On-Time Delivery Rate", 45, "%", 90, MetricStatus.Critical, MetricTrend.Down, -12, "deliveryTime", "spr-012", "Percentage of tasks completed within the estimated time frame"),
            createMetric("m-012-04", "Comment Response Time", 8.2, "hours", 2, MetricStatus.Critical, MetricTrend.Up, 25, "commentsResponse", "spr-012", "Average wait time for responses to task comments and clarifications"),
            createMetric("m-012-05", "Task Rejection Rate", 38, "%", 10, MetricStatus.Critical, MetricTrend.Up, 15, "rejectionRate", "spr-012", "Percentage of tasks returned from QA or Review due to non-approval"),
            createMetric("m-012-06", "Urgent Alert Count", 24, "alerts", 5, MetricStatus.Critical, MetricTrend.Up, 30, "alertResponse", "spr-012", "High volume of system alerts causing significant distraction"),
            createMetric("m-012-07", "Stalled Red Flags", 7, "flags", 0, MetricStatus.Critical, MetricTrend.Up, 40, "redFlagResponse", "spr-012", "Red flags that remained unresolved for more than 48 hours"),
            createMetric("m-012-08", "Average Lead Time", 6.8, "days", 3, MetricStatus.Critical, MetricTrend.Up, 18, "deliveryTime", "spr-012", "Average time from task creation to final approval"),
            createMetric("m-012-09", "Unanswered Comments", 18, "comments", 2, MetricStatus.Critical, MetricTrend.Up, 50, "commentsResponse", "spr-012", "Total number of task-blocking comments without a response"),
        ],
    },
    {
        sprintId: "spr-013",
        healthScore: 65,
        frictionScores: { 
            alertResponse: 60, 
            redFlagResponse: 55, 
            deliveryTime: 68, 
            commentsResponse: 62, 
            rejectionRate: 70 
        },
        metrics: [
            createMetric("m-013-01", "Alert Response Time", 6.5, "hours", 2, MetricStatus.Warning, MetricTrend.Down, -55, "alertResponse", "spr-013", "Response time improved significantly with dedicated alert monitors"),
            createMetric("m-013-02", "Red Flag Resolution", 1.8, "days", 1, MetricStatus.Warning, MetricTrend.Down, -44, "redFlagResponse", "spr-013", "Faster resolution after morning stand-up review process"),
            createMetric("m-013-03", "On-Time Delivery Rate", 72, "%", 90, MetricStatus.Warning, MetricTrend.Up, 60, "deliveryTime", "spr-013", "Delivery efficiency increased as requirements stabilized"),
            createMetric("m-013-04", "Comment Response Time", 4.1, "hours", 2, MetricStatus.Warning, MetricTrend.Down, -50, "commentsResponse", "spr-013", "Better comment engagement after notification optimization"),
            createMetric("m-013-05", "Task Rejection Rate", 21, "%", 10, MetricStatus.Warning, MetricTrend.Down, -45, "rejectionRate", "spr-013", "Lower rejection rate due to stricter readiness criteria"),
            createMetric("m-013-06", "Urgent Alert Count", 12, "alerts", 5, MetricStatus.Warning, MetricTrend.Down, -50, "alertResponse", "spr-013", "Alert noise reduced by filter optimization"),
            createMetric("m-013-07", "Stalled Red Flags", 3, "flags", 0, MetricStatus.Warning, MetricTrend.Down, -57, "redFlagResponse", "spr-013", "Fewer flags stalling with clearer owner assignment"),
        ],
    },
    {
        sprintId: "spr-014",
        healthScore: 82,
        frictionScores: { 
            alertResponse: 85, 
            redFlagResponse: 78, 
            deliveryTime: 82, 
            commentsResponse: 88, 
            rejectionRate: 85 
        },
        metrics: [
            createMetric("m-014-01", "Alert Response Time", 1.8, "hours", 2, MetricStatus.Healthy, MetricTrend.Down, -72, "alertResponse", "spr-014", "Currently exceeding target response time for all system alerts"),
            createMetric("m-014-02", "Red Flag Resolution", 0.9, "days", 1, MetricStatus.Healthy, MetricTrend.Down, -50, "redFlagResponse", "spr-014", "Most red flags resolved same-day"),
            createMetric("m-014-03", "On-Time Delivery Rate", 88, "%", 90, MetricStatus.Healthy, MetricTrend.Up, 22, "deliveryTime", "spr-014", "Near target delivery rate. High correlation with requirement stability"),
            createMetric("m-014-04", "Comment Response Time", 1.5, "hours", 2, MetricStatus.Healthy, MetricTrend.Down, -63, "commentsResponse", "spr-014", "Exceptional comment engagement across the whole team"),
            createMetric("m-014-05", "Task Rejection Rate", 8, "%", 10, MetricStatus.Healthy, MetricTrend.Down, -62, "rejectionRate", "spr-014", "Passing target rejection rate; significant improvement in first-pass quality"),
            createMetric("m-014-06", "Urgent Alert Count", 4, "alerts", 5, MetricStatus.Healthy, MetricTrend.Down, -66, "alertResponse", "spr-014", "Alert volume remains low and manageable"),
            createMetric("m-014-07", "Stalled Red Flags", 1, "flags", 0, MetricStatus.Healthy, MetricTrend.Down, -66, "redFlagResponse", "spr-014", "Only one flag significantly delayed this sprint"),
        ],
    },
];
