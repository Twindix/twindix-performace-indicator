import { getStorageItem } from "./storage";

const getDateFormat = (): string => {
    const settings = getStorageItem<{ dateFormat?: string }>("twindix_perf_settings");
    return settings?.dateFormat ?? "MMM D, YYYY";
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => n.toString().padStart(2, "0");

const applyFormat = (date: Date, fmt: string): string => {
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();

    switch (fmt) {
        case "DD/MM/YYYY": return `${pad(d)}/${pad(m + 1)}/${y}`;
        case "MM/DD/YYYY": return `${pad(m + 1)}/${pad(d)}/${y}`;
        case "YYYY-MM-DD": return `${y}-${pad(m + 1)}-${pad(d)}`;
        default: return `${months[m]} ${d}, ${y}`;
    }
};

export const formatDate = (dateStr: string): string => {
    return applyFormat(new Date(dateStr), getDateFormat());
};

export const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const datePart = applyFormat(date, getDateFormat());
    const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${datePart}, ${timePart}`;
};

export const daysAgo = (dateStr: string): number => {
    const now = new Date();
    const date = new Date(dateStr);
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

export const daysBetween = (start: string, end: string): number => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};
