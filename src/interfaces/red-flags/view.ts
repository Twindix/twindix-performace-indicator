import type { RedFlagFormStateInterface, RedFlagInterface } from "./domain";

export interface RedFlagCardPropsInterface {
    redFlag: RedFlagInterface;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (redFlag: RedFlagInterface) => void;
    onDelete: (redFlag: RedFlagInterface) => void;
}

export interface RedFlagsListPropsInterface {
    redFlags: RedFlagInterface[];
    canEditFor: (redFlag: RedFlagInterface) => boolean;
    canDeleteFor: (redFlag: RedFlagInterface) => boolean;
    onEdit: (redFlag: RedFlagInterface) => void;
    onDelete: (redFlag: RedFlagInterface) => void;
}

export interface RedFlagFormDialogPropsInterface {
    open: boolean;
    target: RedFlagInterface | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (redFlag: RedFlagInterface) => void;
}

export interface DeleteRedFlagDialogPropsInterface {
    target: RedFlagInterface | null;
    onOpenChange: (open: boolean) => void;
    onDeleted: (id: string) => void;
}

export interface UseRedFlagFormReturnInterface {
    form: RedFlagFormStateInterface;
    isSubmitting: boolean;
    setField: <K extends keyof RedFlagFormStateInterface>(field: K, value: RedFlagFormStateInterface[K]) => void;
    reset: () => void;
    submit: () => Promise<RedFlagInterface | null>;
}

export interface UseRedFlagActionsReturnInterface {
    deleteTarget: RedFlagInterface | null;
    isDeleting: boolean;
    setDeleteTarget: (target: RedFlagInterface | null) => void;
    confirmDelete: () => Promise<string | null>;
}
