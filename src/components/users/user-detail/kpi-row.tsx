import { Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { KpiRowPropsInterface } from "@/interfaces/users";

import { Stat } from "../stat";

export const KpiRow = ({ topStats }: KpiRowPropsInterface) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
            <CardContent className="p-4">
                <Stat
                    label={t("Delivery Rate")}
                    value={topStats.delivery_rate}
                    suffix="%"
                    color={topStats.delivery_rate >= 70 ? "text-success" : "text-warning"}
                />
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <Stat
                    label={t("Points Done")}
                    value={topStats.points_done.done}
                    suffix={`/${topStats.points_done.total}`}
                />
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <Stat
                    label={t("Avg Response")}
                    value={topStats.avg_response_hours}
                    suffix="h"
                    color={topStats.avg_response_hours <= 4 ? "text-success" : "text-warning"}
                />
            </CardContent>
        </Card>
    </div>
);
