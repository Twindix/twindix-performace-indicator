import { Plus } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { decisionsConstants } from "@/constants";
import { DecisionCategory } from "@/enums";
import { t, useDecisionForm } from "@/hooks";
import type { AddDecisionDialogPropsInterface } from "@/interfaces/decisions";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

export const AddDecisionDialog = ({ open, onOpenChange, onCreated }: AddDecisionDialogPropsInterface) => {
    const { form, errors, isSubmitting, setField, reset, submit } = useDecisionForm();

    const handleOpenChange = (next: boolean) => {
        if (!next) reset();
        onOpenChange(next);
    };

    const handleSubmit = async () => {
        const created = await submit();
        if (created) {
            onCreated(created);
            reset();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("Add Decision")}</DialogTitle>
                    <DialogDescription>{t("New decisions are submitted as Pending and require PM approval.")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="dec-title">{t("Title")} *</Label>
                        <Input
                            id="dec-title"
                            value={form.title}
                            onChange={(e) => setField("title", e.target.value)}
                            placeholder={t("e.g. Adopt React Query for data fetching")}
                        />
                        {errors.title && <p className="text-xs text-error">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="dec-description">{t("Description")} *</Label>
                        <Textarea
                            id="dec-description"
                            rows={3}
                            value={form.description}
                            onChange={(e) => setField("description", e.target.value)}
                            placeholder={t("What is this decision about?")}
                        />
                        {errors.description && <p className="text-xs text-error">{errors.description}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Category")}</Label>
                        <Select value={form.category} onValueChange={(v) => setField("category", v as DecisionCategory)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {decisionsConstants.createableCategories.map((c) => (
                                    <SelectItem key={c} value={c}>{t(decisionsConstants.categoryLabels[c])}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-lg bg-warning-light border border-warning/20 px-3 py-2">
                        <p className="text-xs text-warning font-medium">{t("Status will be set to Pending — a PM must approve before it takes effect.")}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{t("Cancel")}</Button>
                        <Button onClick={handleSubmit} loading={isSubmitting} className="gap-2">
                            {!isSubmitting && <Plus className="h-4 w-4" />}
                            {t("Submit Decision")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
