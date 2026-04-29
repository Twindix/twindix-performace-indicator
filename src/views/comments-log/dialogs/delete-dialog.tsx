import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { DeleteCommentDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteCommentDialog = ({ open, onConfirm, onClose }: DeleteCommentDialogPropsInterface) => (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{t("Delete Comment")}</DialogTitle></DialogHeader>
            <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>{t("Cancel")}</Button>
                <Button variant="destructive" onClick={onConfirm}>{t("Delete")}</Button>
            </div>
        </DialogContent>
    </Dialog>
);
