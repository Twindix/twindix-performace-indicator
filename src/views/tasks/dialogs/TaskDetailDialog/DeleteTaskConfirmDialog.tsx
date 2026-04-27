import { Button } from "@/atoms";
import { tasksConstants } from "@/constants";
import { t } from "@/hooks";
import type { DeleteTaskConfirmDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteTaskConfirmDialog = ({
    open,
    onOpenChange,
    taskTitle,
    isDeleting,
    onConfirm,
}: DeleteTaskConfirmDialogPropsInterface) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>{t(tasksConstants.deleteConfirmTitle)}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary">
                {t("Are you sure you want to delete")} <strong className="text-text-dark">{taskTitle}</strong>? {t("This action cannot be undone.")}
            </p>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>{t("Cancel")}</Button>
                <Button variant="destructive" onClick={onConfirm} loading={isDeleting}>{t("Delete")}</Button>
            </div>
        </DialogContent>
    </Dialog>
);
