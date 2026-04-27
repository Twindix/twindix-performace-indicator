import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { DeleteAlertDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteAlertDialog = ({ open, isLoading, onClose, onConfirm }: DeleteAlertDialogPropsInterface) => (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>{t("Delete Alert")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>{t("Cancel")}</Button>
                <Button variant="destructive" onClick={onConfirm} loading={isLoading}>{t("Delete")}</Button>
            </div>
        </DialogContent>
    </Dialog>
);
