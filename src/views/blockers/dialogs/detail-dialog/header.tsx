import { Edit, ShieldAlert, Trash2 } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { blockersConstants } from "@/constants";
import { t } from "@/hooks";
import type { BlockerDetailHeaderPropsInterface } from "@/interfaces";
import { DialogHeader, DialogTitle } from "@/ui";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const BlockerDetailHeader = ({
    blocker,
    permissions,
    isDeleting,
    onEdit,
    onDelete,
}: BlockerDetailHeaderPropsInterface) => {
    const statusVariant = blocker.status
        ? (blockersConstants.statusVariants[blocker.status] ?? "secondary")
        : "secondary";
    const severityVariant = blockersConstants.severityVariants[blocker.severity] ?? "secondary";

    return (
        <DialogHeader>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
                <ShieldAlert className="h-5 w-5 text-primary" />
                {blocker.status && (
                    <Badge variant={statusVariant}>
                        {t(capitalize(blocker.status))}
                    </Badge>
                )}
                <Badge variant="outline">{t(blocker.type)}</Badge>
                <Badge variant={severityVariant}>{t(capitalize(blocker.severity))}</Badge>
                <div className="ms-auto flex items-center gap-1.5 me-8">
                    {permissions.canEdit && (
                        <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 gap-1.5 text-xs">
                            <Edit className="h-3.5 w-3.5" />
                            {t("Edit")}
                        </Button>
                    )}
                    {permissions.canDelete && (
                        <Button variant="ghost" size="sm" onClick={onDelete} loading={isDeleting} className="h-7 gap-1.5 text-xs text-error hover:text-error hover:bg-error-light">
                            {!isDeleting && <Trash2 className="h-3.5 w-3.5" />}
                            {t("Delete")}
                        </Button>
                    )}
                </div>
            </div>
            <DialogTitle className="text-xl">{blocker.title}</DialogTitle>
            {blocker.description && <p className="text-sm text-text-secondary">{blocker.description}</p>}
        </DialogHeader>
    );
};
