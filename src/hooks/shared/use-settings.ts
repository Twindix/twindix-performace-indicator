import { useCallback, useSyncExternalStore } from "react";

import { getStorageItem, setStorageItem } from "@/utils";

const SETTINGS_KEY = "twindix_perf_settings";

export interface AppSettings {
    compactView: boolean;
    notifications: {
        blockerAlerts: boolean;
        slaBreaches: boolean;
        sprintSummary: boolean;
        decisionUpdates: boolean;
    };
    language: "en" | "ar";
    dateFormat: "MMM D, YYYY" | "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
}

export const defaultSettings: AppSettings = {
    compactView: false,
    notifications: { blockerAlerts: true, slaBreaches: true, sprintSummary: false, decisionUpdates: true },
    language: "en",
    dateFormat: "MMM D, YYYY",
};

let listeners: (() => void)[] = [];
let cachedSettings: AppSettings | null = null;

export const getSettings = (): AppSettings => {
    if (!cachedSettings) {
        cachedSettings = getStorageItem<AppSettings>(SETTINGS_KEY) ?? defaultSettings;
    }
    return cachedSettings;
};

export const saveSettings = (next: AppSettings) => {
    cachedSettings = next;
    setStorageItem(SETTINGS_KEY, next);
    document.documentElement.dir = next.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next.language === "ar" ? "ar" : "en";
    listeners.forEach((l) => l());
};

const init = getSettings();
document.documentElement.dir = init.language === "ar" ? "rtl" : "ltr";
document.documentElement.lang = init.language === "ar" ? "ar" : "en";

export const useSettings = (): [AppSettings, (partial: Partial<AppSettings>) => void] => {
    const settings = useSyncExternalStore(
        (cb) => { listeners.push(cb); return () => { listeners = listeners.filter((l) => l !== cb); }; },
        getSettings,
    );
    const update = useCallback((partial: Partial<AppSettings>) => {
        saveSettings({ ...getSettings(), ...partial });
    }, []);
    return [settings, update];
};
