import { Trash2 } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { decisionsConstants } from "@/constants";
import { t } from "@/hooks";
import type { DecisionDetailDialogPropsInterface } from "@/interfaces/decisions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";

import { DecisionDetailBody } from "./body";
import { DecisionStatusActions } from "./status-actions";

export const DecisionDetailDialog = ({
    target,
    isLoadingDetail,
    permissions,
    onOpenChange,
    onSetStatus,
    onDelete,
}: DecisionDetailDialogPropsInterface) => (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {target && (
                <>
                    <DialogHeader>
                        <DialogTitle>{target.title}</DialogTitle>
                        <DialogDescription>{t("Decision details")}</DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={decisionsConstants.statusVariants[target.status]}>
                            {t(decisionsConstants.statusLabels[target.status])}
                        </Badge>
                        {target.category && (
                            <Badge variant="outline">{t(decisionsConstants.categoryLabels[target.category])}</Badge>
                        )}
                        {isLoadingDetail && <span className="text-xs text-text-muted">{t("Refreshing...")}</span>}
                    </div>

                    {permissions.setStatus && (
                        <DecisionStatusActions decision={target} onSetStatus={onSetStatus} />
                    )}

                    <DecisionDetailBody decision={target} />

                    {permissions.delete && (
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                onClick={() => onDelete(target.id)}
                                className="gap-1 text-error border-error hover:bg-error-light"
                            >
                                <Trash2 className="h-4 w-4" /> {t("Delete")}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </DialogContent>
    </Dialog>
);

export { DecisionStatusActions } from "./status-actions";
export { DecisionDetailBody } from "./body";
