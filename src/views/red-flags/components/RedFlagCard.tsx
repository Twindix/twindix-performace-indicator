import { Edit, Trash2 } from "lucide-react";

import { Badge, Card, CardContent } from "@/atoms";
import { redFlagsConstants } from "@/constants";
import { t } from "@/hooks";
import type { RedFlagCardPropsInterface } from "@/interfaces/red-flags";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDateTime } from "@/utils";

export const RedFlagCard = ({ redFlag, canEdit, canDelete, onEdit, onDelete }: RedFlagCardPropsInterface) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            variant={redFlagsConstants.severityVariants[redFlag.severity] ?? "secondary"}
                            className="capitalize text-[10px]"
                        >
                            {redFlag.severity}
                        </Badge>
                        {redFlag.is_stalled && <Badge variant="warning" className="text-[10px]">{t("Stalled")}</Badge>}
                    </div>
                    <h3 className="text-sm font-semibold text-text-dark">{redFlag.title}</h3>
                    {redFlag.description && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{redFlag.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {canEdit && (
                        <button
                            onClick={() => onEdit(redFlag)}
                            className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer"
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(redFlag)}
                            className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">{redFlag.reporter.avatar_initials}</AvatarFallback>
                </Avatar>
                <span>{redFlag.reporter.full_name}</span>
                <span className="ml-auto">{formatDateTime(redFlag.created_at)}</span>
            </div>
        </CardContent>
    </Card>
);
