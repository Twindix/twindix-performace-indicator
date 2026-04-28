import type { Permissions } from "@/hooks/shared/use-permissions";
import type { PresenceStatus } from "@/interfaces/auth";
import type { UserInterface } from "@/interfaces/common";
import type { ProjectLiteInterface } from "@/interfaces/projects";
import type { SprintInterface } from "@/interfaces/sprints";

// === View shared groupings ===

export interface EditSprintFormStateInterface {
    name: string;
    start_date: string;
    end_date: string;
}

export interface UserMenuPresenceInterface {
    status: PresenceStatus;
    onChange: (status: PresenceStatus) => void;
}

export interface UserMenuActionsInterface {
    onLogout: () => void;
    onNavigateProfile: () => void;
    onNavigateSettings: () => void;
}

// === Component prop interfaces ===

export interface ProjectSelectorPropsInterface {
    projects: ProjectLiteInterface[];
    value: string;
    onChange: (id: string) => void;
}

export interface SprintSelectorPropsInterface {
    sprints: SprintInterface[];
    value: string;
    onChange: (id: string) => void;
}

export interface EditSprintButtonPropsInterface {
    disabled: boolean;
    onClick: () => void;
}

export interface ThemeTogglePropsInterface {
    isDarkMode: boolean;
    onToggle: () => void;
}

export interface UserMenuPropsInterface {
    user: UserInterface | null;
    isArabic: boolean;
    canEditProfile: boolean;
    presence: UserMenuPresenceInterface;
    actions: UserMenuActionsInterface;
}

export interface UserMenuTriggerPropsInterface {
    user: UserInterface | null;
    presenceStatus: PresenceStatus;
}

export interface UserMenuHeaderPropsInterface {
    name: string | undefined;
    email: string | undefined;
}

export interface PresenceStatusMenuItemsPropsInterface {
    visible: boolean;
    currentStatus: PresenceStatus;
    onChange: (status: PresenceStatus) => void;
}

export interface UserMenuActionsPropsInterface {
    onLogout: () => void;
    onNavigateProfile: () => void;
    onNavigateSettings: () => void;
}

export interface EditSprintDialogPropsInterface {
    open: boolean;
    isSaving: boolean;
    value: EditSprintFormStateInterface;
    onChange: (value: EditSprintFormStateInterface) => void;
    onClose: () => void;
    onSave: () => void;
}

// === Hook arg / return types ===

export interface UseEditSprintFormArgsInterface {
    activeSprint: SprintInterface | undefined;
    onSaved: () => unknown;
}

export interface UseEditSprintFormReturnInterface {
    isOpen: boolean;
    isSaving: boolean;
    value: EditSprintFormStateInterface;
    onChange: (value: EditSprintFormStateInterface) => void;
    open: () => void;
    close: () => void;
    onSave: () => Promise<void>;
}

export interface UseAutoActiveSprintArgsInterface {
    sprints: SprintInterface[];
    activeSprintId: string;
    onSetActive: (id: string) => void;
}

export type TopbarPermissions = Permissions;
