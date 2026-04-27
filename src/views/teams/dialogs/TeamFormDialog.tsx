import { Button, Input, Label, Textarea } from "@/atoms";
import { t } from "@/hooks";
import type { TeamFormDialogPropsInterface } from "@/interfaces";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const TeamFormDialog = ({ open, editTarget, fields, handlers, isSubmitting }: TeamFormDialogPropsInterface) => (
    <Dialog open={open || editTarget !== null} onOpenChange={(o) => !o && handlers.onClose()}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>{editTarget ? t("Edit Team") : t("Add Team")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
                <div className="space-y-2">
                    <Label htmlFor="team-name">{t("Name")} <span className="text-error">*</span></Label>
                    <Input
                        id="team-name"
                        value={fields.name}
                        onChange={(e) => handlers.onNameChange(e.target.value)}
                        placeholder={t("Frontend")}
                    />
                    {fields.nameError && <p className="text-xs text-error">{fields.nameError}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="team-desc">{t("Description")}</Label>
                    <Textarea
                        id="team-desc"
                        rows={3}
                        value={fields.description}
                        onChange={(e) => handlers.onDescriptionChange(e.target.value)}
                        placeholder={t("What does this team do?")}
                    />
                    {fields.descriptionError && <p className="text-xs text-error">{fields.descriptionError}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                    <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                </DialogClose>
                <Button onClick={handlers.onSubmit} loading={isSubmitting} disabled={!fields.name.trim()}>
                    {editTarget ? t("Save Changes") : t("Create Team")}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);
