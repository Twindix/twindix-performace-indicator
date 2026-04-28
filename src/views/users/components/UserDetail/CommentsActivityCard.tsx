import { MessageCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { CommentsActivityCardPropsInterface } from "@/interfaces/users";

import { Bar } from "../Bar";
import { Stat } from "../Stat";

const rateColor = (rate: number, prefix: "bg" | "text"): string => {
    if (rate >= 80) return `${prefix}-success`;
    if (rate >= 50) return `${prefix}-warning`;
    return `${prefix}-error`;
};

export const CommentsActivityCard = ({ commentsActivity }: CommentsActivityCardPropsInterface) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />{t("Comments Activity")}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <Stat label={t("Written")} value={commentsActivity.written} />
                <Stat label={t("Mentioned in")} value={commentsActivity.mentioned_in} />
                <Stat label={t("Answered")} value={commentsActivity.answered} color="text-success" />
                <Stat
                    label={t("Answer Rate")}
                    value={commentsActivity.answer_rate}
                    suffix="%"
                    color={rateColor(commentsActivity.answer_rate, "text")}
                />
            </div>
            {commentsActivity.mentioned_in > 0 && (
                <>
                    <p className="text-xs text-text-muted mb-1.5">{t("Mention response rate")}</p>
                    <Bar
                        value={commentsActivity.answer_rate}
                        max={100}
                        color={rateColor(commentsActivity.answer_rate, "bg")}
                    />
                </>
            )}
            {commentsActivity.written === 0 && commentsActivity.mentioned_in === 0 && (
                <p className="text-xs text-text-muted">{t("No comment activity")}</p>
            )}
        </CardContent>
    </Card>
);
