import type { LucideIcon } from "lucide-react";

import type { AppSettings } from "@/hooks";
import type { UserSettingsInterface } from "@/interfaces/common";

export interface SettingTogglePropsInterface {
    label: string;
    description: string;
    checked: boolean;
    icon: LucideIcon;
    onToggle: () => void;
}

export interface AppearanceCardPropsInterface {
    isDarkMode: boolean;
    compactView: boolean;
    onToggleDarkMode: () => void;
    onToggleCompactView: () => void;
}

export interface LanguageDateCardPropsInterface {
    language: string | null;
    dateFormat: string | null;
    onLanguageChange: (next: AppSettings["language"]) => void;
    onDateFormatChange: (next: AppSettings["dateFormat"]) => void;
}

export interface UseUpdateSettingReturnInterface {
    updateSetting: (patch: Partial<UserSettingsInterface>) => Promise<void>;
}
