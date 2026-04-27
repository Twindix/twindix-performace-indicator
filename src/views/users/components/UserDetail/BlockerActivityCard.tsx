import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { BlockerActivityCardPropsInterface } from "@/interfaces/users";

import { Stat } from "../Stat";

export const BlockerActivityCard = ({ blockerActivity }: BlockerActivityCardPropsInterface) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />{t("Blocker Activity")}
            </CardTitle>
        </CardHeader>
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
    </Card>
);
