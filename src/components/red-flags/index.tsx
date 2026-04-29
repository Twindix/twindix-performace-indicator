import { Badge } from "@/atoms";
import { EntityCard } from "@/components/shared";
import { redFlagsConstants } from "@/constants";
import { t } from "@/hooks";
import type { RedFlagCardPropsInterface } from "@/interfaces/red-flags";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDateTime } from "@/utils";

export const RedFlagCard = ({ redFlag, canEdit, canDelete, onEdit, onDelete }: RedFlagCardPropsInterface) => (
    <EntityCard>
        <EntityCard.Row>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant={redFlagsConstants.severityVariants[redFlag.severity] ?? "secondary"} className="capitalize text-[10px]">
                        {redFlag.severity}
                    </Badge>
                    {redFlag.is_stalled && <Badge variant="warning" className="text-[10px]">{t("Stalled")}</Badge>}
                </div>
                <h3 className="text-sm font-semibold text-text-dark">{redFlag.title}</h3>
                {redFlag.description && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{redFlag.description}</p>}
            </div>
            <EntityCard.Actions canEdit={canEdit} canDelete={canDelete} onEdit={() => onEdit(redFlag)} onDelete={() => onDelete(redFlag)} />
        </EntityCard.Row>
        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
            <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px]">{redFlag.reporter.avatar_initials}</AvatarFallback>
            </Avatar>
            <span>{redFlag.reporter.full_name}</span>
            <span className="ml-auto">{formatDateTime(redFlag.created_at)}</span>
        </div>
    </EntityCard>
);
