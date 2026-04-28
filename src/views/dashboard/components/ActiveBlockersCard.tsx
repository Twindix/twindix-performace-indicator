import { AlertTriangle } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { ActiveBlockersCardPropsInterface } from "@/interfaces";

import { ActiveBlockerItem } from "./ActiveBlockerItem";

export const ActiveBlockersCard = ({ blockers }: ActiveBlockersCardPropsInterface) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-error" />
                {t("Active Blockers")}
                <Badge variant="error">{blockers.length}</Badge>
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
            {blockers.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">{t("No active blockers")}</p>
            ) : blockers.map((blocker) => (
                <ActiveBlockerItem key={blocker.id} blocker={blocker} />
            ))}
        </CardContent>
    </Card>
);
