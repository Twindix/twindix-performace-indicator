import { useCallback, useState } from "react";

import type { UseEditProfileNameReturnInterface } from "@/interfaces/profile";

import { useAuth } from "../auth";
import { useUpdateMe } from "../auth/use-update-me";
import { useUpdateUser } from "../auth/use-update-user";

export const useEditProfileName = (): UseEditProfileNameReturnInterface => {
    const { user } = useAuth();
    const { onUpdateUser } = useUpdateUser();
    const { updateHandler, isLoading: isSaving } = useUpdateMe();

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(user?.full_name ?? "");

    const onStart = useCallback(() => {
        setValue(user?.full_name ?? "");
        setIsEditing(true);
    }, [user]);

    const onCancel = useCallback(() => {
        setValue(user?.full_name ?? "");
        setIsEditing(false);
    }, [user]);

    const onChange = useCallback((next: string) => setValue(next), []);

    const onSave = useCallback(async () => {
        if (!value.trim()) return;
        const updated = await updateHandler({ full_name: value.trim() });
        if (updated) {
            onUpdateUser(updated);
            setIsEditing(false);
        }
    }, [value, updateHandler, onUpdateUser]);

    return {
        edit: { isEditing, value, isSaving, onStart, onCancel, onSave, onChange },
    };
};
