import type { UserInterface } from "@/interfaces/common";

export interface ProfileNameEditStateInterface {
    isEditing: boolean;
    value: string;
    isSaving: boolean;
    onStart: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChange: (value: string) => void;
}

export interface ProfileCardPropsInterface {
    user: UserInterface;
    canEdit: boolean;
    edit: ProfileNameEditStateInterface;
}

export interface ProfileNameEditorPropsInterface {
    user: UserInterface;
    canEdit: boolean;
    edit: ProfileNameEditStateInterface;
}

export interface ProfileInfoListPropsInterface {
    user: UserInterface;
}

export interface ProfileInfoRowPropsInterface {
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}

export interface UseEditProfileNameReturnInterface {
    edit: ProfileNameEditStateInterface;
}
