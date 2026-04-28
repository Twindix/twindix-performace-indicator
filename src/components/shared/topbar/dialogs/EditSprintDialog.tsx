import { Button, Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { EditSprintDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const EditSprintDialog = ({
    open,
    isSaving,
    value,
    onChange,
    onClose,
    onSave,
}: EditSprintDialogPropsInterface) => (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>{t("Edit Sprint")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
                <div className="space-y-2">
                    <Label htmlFor="sp-name">{t("Name")} <span className="text-error">*</span></Label>
                    <Input
                        id="sp-name"
                        value={value.name}
                        onChange={(e) => onChange({ ...value, name: e.target.value })}
                        placeholder={t("Sprint name")}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="sp-start">{t("Start Date")}</Label>
                        <Input
                            id="sp-start"
                            type="date"
                            value={value.start_date}
                            onChange={(e) => onChange({ ...value, start_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sp-end">{t("End Date")}</Label>
                        <Input
                            id="sp-end"
                            type="date"
                            value={value.end_date}
                            onChange={(e) => onChange({ ...value, end_date: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                    <Button variant="outline" disabled={isSaving}>{t("Cancel")}</Button>
                </DialogClose>
                <Button onClick={onSave} disabled={isSaving || !value.name.trim()}>
                    {isSaving ? t("Saving...") : t("Save Changes")}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);
