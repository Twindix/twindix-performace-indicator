import type { AddUserFormErrorsInterface, AddUserFormStateInterface } from "@/interfaces/users";

export const mapFieldErrorsToForm = (fieldErrors: Record<string, string[]>): AddUserFormErrorsInterface => {
    const mapped: AddUserFormErrorsInterface = {};
    for (const key of Object.keys(fieldErrors)) {
        mapped[key as keyof AddUserFormStateInterface] = fieldErrors[key]?.[0];
    }
    return mapped;
};
