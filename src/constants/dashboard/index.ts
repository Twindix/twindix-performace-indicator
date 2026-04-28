import { Bell, Flag, MessageCircle, XCircle, Zap } from "lucide-react";

import type { FrictionAreaConfigInterface, MetricTileConfigInterface } from "@/interfaces";

export const dashboardConstants = {
    errors: {
        fetchFailed: "Failed to load dashboard.",
        healthScoreFailed: "Failed to load health score.",
        metricsFailed: "Failed to load metrics.",
        genericError: "Something went wrong.",
    },
};

export const frictionAreaConfig: FrictionAreaConfigInterface[] = [
    { key: "alert_response",    labelKey: "Alert Response",     icon: Bell,          textColor: "text-blue-500" },
    { key: "red_flag_response", labelKey: "Red Flag Response",  icon: Flag,          textColor: "text-error" },
    { key: "time_delivery",     labelKey: "Time Delivery",      icon: Zap,           textColor: "text-success" },
    { key: "comments_response", labelKey: "Comments Response",  icon: MessageCircle, textColor: "text-purple-500" },
    { key: "not_approval",      labelKey: "Not Approval (%)",   icon: XCircle,       textColor: "text-warning" },
];

export const metricsTilesConfig: MetricTileConfigInterface[] = [
    { labelKey: "On-Time Delivery",   field: "on_time_delivery_rate", suffix: "%" },
    { labelKey: "Task Rejection",     field: "task_rejection_rate",   suffix: "%" },
    { labelKey: "Urgent Alerts",      field: "urgent_alert_count" },
    { labelKey: "Stalled Red Flags",  field: "stalled_red_flags" },
    { labelKey: "Total Red Flags",    field: "total_red_flags" },
    { labelKey: "Total Comments",     field: "total_comments" },
    { labelKey: "Responded Comments", field: "responded_comments" },
];
