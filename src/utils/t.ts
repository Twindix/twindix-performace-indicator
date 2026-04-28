import { translations } from "@/data/translations";
import { getStorageItem } from "@/utils/storage";

const SETTINGS_KEY = "twindix_perf_settings";

const getLang = (): "en" | "ar" => {
    const s = getStorageItem<{ language: "en" | "ar" }>(SETTINGS_KEY);
    return s?.language ?? "en";
};

export const t = (key: string): string => translations[key]?.[getLang()] ?? key;
