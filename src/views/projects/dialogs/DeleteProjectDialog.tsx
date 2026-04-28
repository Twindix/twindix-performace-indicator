import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { DeleteProjectDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteProjectDialog = ({ target, isDeleting, onClose, onConfirm }: DeleteProjectDialogPropsInterface) => (
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>{t("Delete Project")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-muted mt-2">
                {t("Are you sure you want to delete")} <strong>{target?.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                    <Button variant="outline" disabled={isDeleting}>{t("Cancel")}</Button>
                </DialogClose>
                <Button variant="destructive" onClick={onConfirm} loading={isDeleting}>{t("Delete")}</Button>
            </div>
        </DialogContent>
    </Dialog>
);
