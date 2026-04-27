import { t } from "@/hooks";
import type { AddUserFormErrorsInterface, AddUserFormStateInterface } from "@/interfaces/users";

export const validateAddUserForm = (form: AddUserFormStateInterface): AddUserFormErrorsInterface => {
    const errors: AddUserFormErrorsInterface = {};
    if (!form.full_name.trim())  errors.full_name  = t("Required");
    if (!form.email.trim())      errors.email      = t("Required");
    if (!form.password.trim())   errors.password   = t("Required");
    if (!form.role_label.trim()) errors.role_label = t("Required");
    if (!form.team_id)           errors.team_id    = t("Required");
    return errors;
};
