import { Flag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { RedFlagsCardPropsInterface } from "@/interfaces/users";

import { Stat } from "../stat";

export const RedFlagsCard = ({ redFlags }: RedFlagsCardPropsInterface) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Flag className="h-4 w-4 text-error" />{t("Red Flags")}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <Stat
                    label={t("Raised by user")}
                    value={redFlags.raised_by_user}
                    color={redFlags.raised_by_user > 0 ? "text-error" : "text-text-dark"}
                />
                <Stat label={t("Total in sprint")} value={redFlags.total_in_sprint} />
            </div>
            {redFlags.raised_by_user === 0 && (
                <p className="text-xs text-text-muted mt-3">{t("No red flags raised by this user")}</p>
            )}
        </CardContent>
    </Card>
);
