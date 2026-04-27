import type { AppSettings } from "@/hooks";

export const settingsConstants = {
    languageOptions: [
        { value: "en" as AppSettings["language"], label: "English" },
        { value: "ar" as AppSettings["language"], label: "العربية" },
    ],
    dateFormatOptions: [
        { value: "MMM D, YYYY" as AppSettings["dateFormat"], label: "MMM D, YYYY" },
        { value: "DD/MM/YYYY"  as AppSettings["dateFormat"], label: "DD/MM/YYYY" },
        { value: "MM/DD/YYYY"  as AppSettings["dateFormat"], label: "MM/DD/YYYY" },
        { value: "YYYY-MM-DD"  as AppSettings["dateFormat"], label: "YYYY-MM-DD" },
    ],
    appInfo: {
        name:    "Twindix Performance Indicator",
        version: "0.1.0",
    },
};
