import { Button, Input, Label, Textarea } from "@/atoms";
import { t } from "@/hooks";
import type { AlertFormDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

import { UserMultiSelect } from "@/components/alerts";

export const AlertFormDialog = ({
    open,
    isEdit,
    isSubmitting,
    form,
    users,
    actions,
}: AlertFormDialogPropsInterface) => (
    <Dialog open={open} onOpenChange={(o) => { if (!o) actions.onClose(); }}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{isEdit ? t("Edit Alert") : t("Create Alert")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
                <div className="space-y-2">
                    <Label>{t("Title")} <span className="text-error">*</span></Label>
                    <Input
                        value={form.value.title}
                        onChange={(e) => form.onChange({ ...form.value, title: e.target.value })}
                        placeholder={t("Alert title")}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{t("Body")}</Label>
                    <Textarea
                        rows={3}
                        value={form.value.body}
                        onChange={(e) => form.onChange({ ...form.value, body: e.target.value })}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>
                        {t("Mention Users")}
                        <span className="ms-2 text-[10px] text-text-muted font-normal">
                            {form.value.mentioned_user_ids.length === 0
                                ? t("(sends to all)")
                                : `(${form.value.mentioned_user_ids.length} ${t("selected")})`}
                        </span>
                    </Label>
                    <UserMultiSelect
                        users={users}
                        selected={form.value.mentioned_user_ids}
                        onChange={(ids) => form.onChange({ ...form.value, mentioned_user_ids: ids })}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                    <Button variant="outline">{t("Cancel")}</Button>
                </DialogClose>
                <Button onClick={actions.onSubmit} loading={isSubmitting} disabled={!form.value.title.trim()}>
                    {isEdit ? t("Save") : t("Create")}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);
