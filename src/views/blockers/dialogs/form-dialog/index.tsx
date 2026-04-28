import { Plus, ShieldAlert } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { BlockerFormDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

import { BlockerFormFields } from "./fields";

const canSubmitForm = (value: BlockerFormDialogPropsInterface["form"]["value"]) =>
    value.title.trim().length > 0 && Boolean(value.ownedBy) && Boolean(value.severity) && Boolean(value.type);

export const BlockerFormDialog = ({
    open,
    isEdit,
    isSubmitting,
    form,
    users,
    actions,
}: BlockerFormDialogPropsInterface) => {
    const canSubmit = canSubmitForm(form.value);

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) actions.onClose(); }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        <DialogTitle>{isEdit ? t("Edit Blocker") : t("Add Blocker")}</DialogTitle>
                    </div>
                </DialogHeader>

                <BlockerFormFields value={form.value} onChange={form.onChange} users={users} />

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={actions.onSubmit} loading={isSubmitting} disabled={!canSubmit} className="gap-2">
                        {!isEdit && !isSubmitting && <Plus className="h-4 w-4" />}
                        {isEdit ? t("Save Changes") : t("Create Blocker")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export { BlockerFormFields } from "./fields";
