import { useCallback, useState } from "react";

import { usersConstants } from "@/constants";
import type { AddUserFormErrorsInterface, AddUserFormStateInterface, UseUsersAddReturnInterface } from "@/interfaces/users";
import { buildCreateUserPayload, mapFieldErrorsToForm, validateAddUserForm } from "@/lib/users";

import { useTeamsListLite } from "../teams";

import { useUsersCreate } from "./use-users-create";

export const useUsersAdd = (): UseUsersAddReturnInterface => {
    const [form, setForm] = useState<AddUserFormStateInterface>({ ...usersConstants.emptyAddUserForm });
    const [errors, setErrors] = useState<AddUserFormErrorsInterface>({});

    const handleFieldErrors = useCallback((fieldErrors: Record<string, string[]>) => {
        setErrors(mapFieldErrorsToForm(fieldErrors));
    }, []);

    const { create, isLoading: isCreating } = useUsersCreate({ onFieldErrors: handleFieldErrors });
    const { teams } = useTeamsListLite();

    const setField = useCallback((field: keyof AddUserFormStateInterface, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (!(field in prev)) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setForm({ ...usersConstants.emptyAddUserForm });
        setErrors({});
    }, []);

    const submit = useCallback(async () => {
        const validation = validateAddUserForm(form);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return null;
        }
        return create(buildCreateUserPayload(form));
    }, [form, create]);

    return { form, errors, teams, isCreating, setField, submit, reset };
};
