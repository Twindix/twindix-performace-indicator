import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { DeleteSprintDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteSprintDialog = ({ target, isDeleting, onClose, onConfirm }: DeleteSprintDialogPropsInterface) => (
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{t("Delete Sprint")}</DialogTitle></DialogHeader>
            <p className="text-sm text-text-secondary">
                {t("Are you sure you want to delete")} <strong className="text-text-dark">{target?.name}</strong>? {t("This action cannot be undone.")}
            </p>
            <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild><Button variant="outline" disabled={isDeleting}>{t("Cancel")}</Button></DialogClose>
                <Button variant="destructive" onClick={onConfirm} loading={isDeleting}>{t("Delete")}</Button>
            </div>
        </DialogContent>
    </Dialog>
);
