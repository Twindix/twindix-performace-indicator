import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { DeleteTeamDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteTeamDialog = ({ open, teamName, isDeleting, onConfirm, onClose }: DeleteTeamDialogPropsInterface) => (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>{t("Delete Team")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-muted mt-2">
                {t("Remove")} <strong>{teamName}</strong>?
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
