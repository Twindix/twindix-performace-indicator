import { Button } from "@/atoms";
import { t, useDeleteRedFlag } from "@/hooks";
import type { DeleteRedFlagDialogPropsInterface } from "@/interfaces/red-flags";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const DeleteRedFlagDialog = ({ target, onOpenChange, onDeleted }: DeleteRedFlagDialogPropsInterface) => {
    const { deleteHandler, isLoading: isDeleting } = useDeleteRedFlag();

    const handleDelete = async () => {
        if (!target) return;
        const ok = await deleteHandler(target.id);
        if (ok) onDeleted(target.id);
    };

    return (
        <Dialog open={!!target} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{t("Delete Red Flag")}</DialogTitle></DialogHeader>
                <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>{t("Cancel")}</Button>
                    <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>{t("Delete")}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
