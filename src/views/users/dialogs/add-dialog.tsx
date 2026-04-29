import { UserCog } from "lucide-react";

import { Button } from "@/atoms";
import { t, useUsersAdd } from "@/hooks";
import type { AddUserDialogPropsInterface } from "@/interfaces/users";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
} from "@/ui";

import { AddUserFormFields } from "./form-fields";

export const AddUserDialog = ({ open, onOpenChange, onCreated }: AddUserDialogPropsInterface) => {
    const { form, errors, teams, isCreating, setField, submit, reset } = useUsersAdd();

    const handleOpenChange = (next: boolean) => {
        if (!next) reset();
        onOpenChange(next);
    };

    const handleSubmit = async () => {
        const created = await submit();
        if (created) {
            reset();
            onOpenChange(false);
            onCreated();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-primary" />
                        {t("Add Team Member")}
                    </DialogTitle>
                </DialogHeader>

                <AddUserFormFields form={form} errors={errors} teams={teams} onChange={setField} />

                <div className="flex justify-end gap-2 mt-2">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isCreating}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} loading={isCreating}>{t("Add Member")}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
