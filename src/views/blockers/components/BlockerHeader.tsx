import { Badge } from "@/atoms";
import { blockersConstants } from "@/constants";
import { t } from "@/hooks";
import type { BlockerCardHeaderPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const BlockerHeader = ({ type, title, description, status, severity }: BlockerCardHeaderPropsInterface) => {
    const typeInfo = blockersConstants.typeConfig[type] ?? blockersConstants.fallbackTypeInfo;
    const TypeIcon = typeInfo.icon;
    const severityVariant = blockersConstants.severityVariants[severity] ?? "secondary";
    const statusVariant = status ? (blockersConstants.statusVariants[status] ?? "secondary") : "secondary";
    const [bgClass, textClass] = typeInfo.color.split(" ");

    return (
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bgClass)}>
                    <TypeIcon className={cn("h-4 w-4", textClass)} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text-dark truncate">{title}</h3>
                    {description && (
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {status && <Badge variant={statusVariant}>{t(capitalize(status))}</Badge>}
                <Badge variant={severityVariant}>{t(capitalize(severity))}</Badge>
            </div>
        </div>
    );
};
