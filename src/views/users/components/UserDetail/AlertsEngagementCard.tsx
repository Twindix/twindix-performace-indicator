import { Bell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { AlertsEngagementCardPropsInterface } from "@/interfaces/users";

import { Bar } from "../Bar";
import { Stat } from "../Stat";

const ackColor = (rate: number, prefix: "bg" | "text"): string => {
    if (rate >= 80) return `${prefix}-success`;
    if (rate >= 50) return `${prefix}-warning`;
    return `${prefix}-error`;
};

export const AlertsEngagementCard = ({ alertsEngagement }: AlertsEngagementCardPropsInterface) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />{t("Alerts Engagement")}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <Stat label={t("Received")} value={alertsEngagement.received} />
                <Stat label={t("Acknowledged")} value={alertsEngagement.acknowledged} color="text-success" />
                <Stat
                    label={t("Ack Rate")}
                    value={alertsEngagement.ack_rate}
                    suffix="%"
                    color={ackColor(alertsEngagement.ack_rate, "text")}
                />
            </div>
            {alertsEngagement.received > 0 ? (
                <>
                    <p className="text-xs text-text-muted mb-1.5">{t("Acknowledgement rate")}</p>
                    <Bar value={alertsEngagement.ack_rate} max={100} color={ackColor(alertsEngagement.ack_rate, "bg")} />
                </>
            ) : (
                <p className="text-xs text-text-muted">{t("No alerts received")}</p>
            )}
        </CardContent>
    </Card>
);
