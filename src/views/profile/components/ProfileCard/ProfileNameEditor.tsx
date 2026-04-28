import { Pencil } from "lucide-react";

import { Button, Input } from "@/atoms";
import { t } from "@/utils";
import type { ProfileNameEditorPropsInterface } from "@/interfaces/profile";

export const ProfileNameEditor = ({ user, canEdit, edit }: ProfileNameEditorPropsInterface) => {
    if (edit.isEditing) {
        return (
            <div className="flex items-center gap-2 mt-1">
                <Input
                    autoFocus
                    value={edit.value}
                    onChange={(e) => edit.onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") edit.onSave();
                        if (e.key === "Escape") edit.onCancel();
                    }}
                    className="text-xl font-bold text-center h-9"
                />
                <Button size="sm" onClick={edit.onSave} loading={edit.isSaving} disabled={!edit.value.trim()}>{t("Save")}</Button>
                <Button size="sm" variant="outline" onClick={edit.onCancel}>{t("Cancel")}</Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-dark">{user.full_name}</h2>
            {canEdit && (
                <button
                    onClick={edit.onStart}
                    className="text-text-muted hover:text-text-dark transition-colors cursor-pointer"
                    aria-label="Edit name"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};
