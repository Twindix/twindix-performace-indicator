import { ArrowLeft, BarChart3 } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { TeamInterface } from "@/interfaces";

interface TeamAnalyticsViewProps {
    team: TeamInterface;
    onBack: () => void;
    onViewMembers: () => void;
}

export const TeamAnalyticsView = ({ team, onBack, onViewMembers }: TeamAnalyticsViewProps) => {
    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    {t("Back to Teams")}
                </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                        <BarChart3 className="h-7 w-7 text-text-muted" />
                    </div>
                </div>
                <h2 className="text-base font-semibold text-text-dark mb-1">{team.name} — {t("Analytics")}</h2>
                <p className="text-sm text-text-muted mb-4">{t("Team analytics are not yet available from the backend.")}</p>
                <Button size="sm" variant="outline" onClick={onViewMembers}>
                    {t("View Members")}
                </Button>
            </div>
        </div>
    );
};
