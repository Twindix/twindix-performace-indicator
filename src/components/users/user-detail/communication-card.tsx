import { MessageSquare } from "lucide-react";

import { CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { CommunicationCardPropsInterface } from "@/interfaces/users";
import { buildResponseDistribution } from "@/lib/users";

import { Bar } from "../bar";
import { Stat } from "../stat";
import { ActivityCard } from "./activity-card";

export const CommunicationCard = ({ communication }: CommunicationCardPropsInterface) => {
    const distribution = buildResponseDistribution(communication.response_time_distribution);

    return (
        <ActivityCard icon={MessageSquare} title={t("Communication Performance")}>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <Stat label={t("Questions Asked")} value={communication.questions_asked} />
                    <Stat label={t("Questions Received")} value={communication.questions_received} />
                    <Stat label={t("Answered")} value={communication.answered} color="text-success" />
                    <Stat
                        label={t("Response Rate")}
                        value={communication.response_rate}
                        suffix="%"
                        color={communication.response_rate >= 80 ? "text-success" : "text-warning"}
                    />
                </div>
                {communication.answered > 0 && (
                    <div>
                        <p className="text-xs text-text-muted mb-2">{t("Response time distribution")}</p>
                        <div className="flex flex-col gap-2">
                            {distribution.map(({ label, count }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-text-secondary">{label}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                    <Bar
                                        value={count}
                                        max={communication.answered}
                                        color={label === "< 1h" ? "bg-success" : label === "> 24h" ? "bg-error" : "bg-warning"}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </ActivityCard>
    );
};
