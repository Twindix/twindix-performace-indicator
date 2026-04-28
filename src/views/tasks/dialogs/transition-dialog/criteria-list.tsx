import { AlertCircle, CheckCircle2 } from "lucide-react";

import { t } from "@/hooks";
import type { TransitionCriteriaListPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

export const TransitionCriteriaList = ({ criteria, allowed, reason }: TransitionCriteriaListPropsInterface) => (
    <>
        {criteria.length > 0 && (
            <div className="mt-4">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    {allowed ? t("Transition Criteria") : t("Required Criteria")}
                </p>
                <div className="space-y-2">
                    {criteria.map((c, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2",
                                c.met ? "bg-success-light/50" : "bg-error-light/50",
                            )}
                        >
                            {c.met
                                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                : <AlertCircle className="h-4 w-4 text-error shrink-0" />}
                            <span className={cn("text-sm", c.met ? "text-text-dark" : "text-error font-medium")}>
                                {c.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <p className={cn("text-sm mt-4 p-3 rounded-lg", allowed ? "bg-success-light/30 text-success" : "bg-error-light/30 text-error")}>
            {reason}
        </p>
    </>
);
