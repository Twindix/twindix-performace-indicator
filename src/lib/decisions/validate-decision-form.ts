import { t } from "@/hooks";
import type { DecisionFormErrorsInterface, DecisionFormStateInterface } from "@/interfaces/decisions";

export const validateDecisionForm = (form: DecisionFormStateInterface): DecisionFormErrorsInterface => {
    const errors: DecisionFormErrorsInterface = {};
    if (!form.title.trim())       errors.title       = t("Title is required");
    if (!form.description.trim()) errors.description = t("Description is required");
    return errors;
};
