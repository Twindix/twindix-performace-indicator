import { TrendingUp } from "lucide-react";

import { CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { BlockerActivityCardPropsInterface } from "@/interfaces/users";

import { Stat } from "../stat";
import { ActivityCard } from "./activity-card";

export const BlockerActivityCard = ({ blockerActivity }: BlockerActivityCardPropsInterface) => (
    <ActivityCard icon={TrendingUp} title={t("Blocker Activity")}>
        <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label={t("Reported")} value={blockerActivity.reported} />
                <Stat label={t("Owned")} value={blockerActivity.owned} />
                <Stat label={t("Resolved")} value={blockerActivity.resolved} color="text-success" />
                <Stat
                    label={t("Resolve Rate")}
                    value={blockerActivity.resolve_rate}
                    suffix="%"
                    color={blockerActivity.resolve_rate >= 70 ? "text-success" : "text-warning"}
                />
            </div>
        </CardContent>
    </ActivityCard>
);
