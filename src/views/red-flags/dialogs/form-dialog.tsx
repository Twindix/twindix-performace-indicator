import { Button, Input, Label, Textarea } from "@/atoms";
import { redFlagsConstants } from "@/constants";
import { t, useRedFlagForm } from "@/hooks";
import type { RedFlagFormDialogPropsInterface } from "@/interfaces/red-flags";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

export const RedFlagFormDialog = ({ open, target, onOpenChange, onSaved }: RedFlagFormDialogPropsInterface) => {
    const { form, isSubmitting, setField, submit } = useRedFlagForm(target);

    const handleSubmit = async () => {
        const res = await submit();
        if (res) {
            onSaved(res);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{target ? t("Edit Red Flag") : t("Add Red Flag")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-3">
                    <div className="space-y-2">
                        <Label>{t("Title")} <span className="text-error">*</span></Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setField("title", e.target.value)}
                            placeholder={t("Describe the risk")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("Description")}</Label>
                        <Textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setField("description", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("Severity")}</Label>
                        <Select value={form.severity} onValueChange={(v) => setField("severity", v as typeof form.severity)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {redFlagsConstants.severityOptions.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>{t(label)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} loading={isSubmitting} disabled={!form.title.trim()}>
                        {target ? t("Save Changes") : t("Create")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
