import { Button, Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { SprintFormDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const SprintFormDialog = ({
    isOpen,
    isEditMode,
    form,
    isSubmitting,
    canSubmit,
    onClose,
    onSubmit,
}: SprintFormDialogPropsInterface) => {
    const { value, onPatch, getError, clearError } = form;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t("Edit Sprint") : t("Add Sprint")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("Name")} <span className="text-error">*</span></Label>
                        <Input
                            id="name"
                            value={value.name}
                            onChange={(e) => { onPatch({ name: e.target.value }); clearError("name"); }}
                            placeholder={t("Sprint 12")}
                        />
                        {getError("name") && <p className="text-xs text-error">{getError("name")}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">{t("Start Date")} <span className="text-error">*</span></Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={value.start_date}
                                onChange={(e) => { onPatch({ start_date: e.target.value }); clearError("start_date"); }}
                            />
                            {getError("start_date") && <p className="text-xs text-error">{getError("start_date")}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">{t("End Date")} <span className="text-error">*</span></Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={value.end_date}
                                onChange={(e) => { onPatch({ end_date: e.target.value }); clearError("end_date"); }}
                            />
                            {getError("end_date") && <p className="text-xs text-error">{getError("end_date")}</p>}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} loading={isSubmitting} disabled={!canSubmit}>
                        {isEditMode ? t("Save Changes") : t("Create Sprint")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
