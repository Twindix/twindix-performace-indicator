import { ListChecks, MessageSquare, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { QuickStatsCardPropsInterface } from "@/interfaces/users";

import { Bar } from "../Bar";

export const QuickStatsCard = ({ quickStats }: QuickStatsCardPropsInterface) => {
    const rows = [
        {
            icon: ListChecks,
            label: t("Tasks assigned"),
            value: quickStats.tasks_assigned,
            barValue: quickStats.tasks_done,
            barMax: quickStats.tasks_assigned,
            sub: `${quickStats.tasks_done} ${t("done")}`,
            color: "bg-success",
            suffix: "",
        },
        {
            icon: MessageSquare,
            label: t("Comm. response"),
            value: quickStats.comm_response_rate,
            barValue: quickStats.comm_response_rate,
            barMax: 100,
            sub: `${quickStats.comm_avg_response_hours}h ${t("avg")}`,
            color: quickStats.comm_response_rate >= 80
                ? "bg-success"
                : quickStats.comm_response_rate >= 50
                    ? "bg-warning"
                    : "bg-error",
            suffix: "%",
        },
        {
            icon: TrendingUp,
            label: t("Blocker resolve"),
            value: quickStats.blocker_resolve_rate,
            barValue: quickStats.blocker_resolve_rate,
            barMax: 100,
            sub: `${quickStats.blockers_resolved}/${quickStats.blockers_owned}`,
            color: quickStats.blocker_resolve_rate >= 70 ? "bg-success" : "bg-warning",
            suffix: "%",
        },
    ];

    return (
        <Card>
            <CardHeader><CardTitle className="text-sm">{t("Quick Stats")}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
                {rows.map(({ icon: Icon, label, value, barValue, barMax, sub, color, suffix }) => (
                    <div key={label} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-text-muted">{label}</span>
                                <span className="font-semibold">{value}{suffix}</span>
                            </div>
                            <Bar value={barValue} max={barMax} color={color} />
                            <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
