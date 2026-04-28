import { t } from "@/hooks";
import type { DecisionDetailBodyPropsInterface } from "@/interfaces/decisions";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDate } from "@/utils";

export const DecisionDetailBody = ({ decision }: DecisionDetailBodyPropsInterface) => {
    const creator = decision.created_by;

    return (
        <div className="mt-4 space-y-4">
            {decision.description && (
                <div>
                    <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Description")}</h4>
                    <p className="text-sm text-text-secondary">{decision.description}</p>
                </div>
            )}
            {decision.outcome && (
                <div>
                    <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Outcome")}</h4>
                    <p className="text-sm text-text-secondary">{decision.outcome}</p>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                {creator && (
                    <div>
                        <h4 className="text-sm font-semibold text-text-dark mb-1">{t("Raised by")}</h4>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[9px]">{creator.avatar_initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-text-secondary">{creator.full_name}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                    <h4 className="text-xs font-medium text-text-muted">{t("Created")}</h4>
                    <p className="text-sm text-text-secondary">{formatDate(decision.created_at)}</p>
                </div>
                {decision.decided_at && (
                    <div>
                        <h4 className="text-xs font-medium text-text-muted">{t("Decided")}</h4>
                        <p className="text-sm text-text-secondary">{formatDate(decision.decided_at)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
