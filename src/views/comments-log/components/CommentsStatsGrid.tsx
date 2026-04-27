import { AtSign, CheckCircle2, Clock, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/atoms";
import { AnimatedNumber } from "@/components/shared";
import { t } from "@/hooks";
import type { CommentsStatsGridPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

export const CommentsStatsGrid = ({ stats, compact }: CommentsStatsGridPropsInterface) => (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                        <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p>
                        <p className="text-xs text-text-muted">{t("Total Comments")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                        <AtSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.withMention} /></p>
                        <p className="text-xs text-text-muted">{t("With Mention")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-success"><AnimatedNumber value={stats.withResponse} /></p>
                        <p className="text-xs text-text-muted">{t("Responded")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-light">
                        <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-warning"><AnimatedNumber value={stats.noResponse} /></p>
                        <p className="text-xs text-text-muted">{t("No Response")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);
