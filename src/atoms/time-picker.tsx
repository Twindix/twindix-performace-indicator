import { useState, useRef, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils";

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
}

const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function parseTime(s: string): { h: number; m: number } | null {
    if (!s) return null;
    const [h, m] = s.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return { h, m };
}

function formatDisplay(h: number, m: number): string {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function TimePicker({ value, onChange, placeholder = "Pick a time", className, disabled, id }: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const parsed = parseTime(value);
    const selectedH = parsed?.h ?? null;
    const selectedM = parsed?.m ?? null;

    const displayValue = parsed ? formatDisplay(parsed.h, parsed.m) : "";

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const scrollToSelected = useCallback(() => {
        if (selectedH !== null && hourListRef.current) {
            const btn = hourListRef.current.querySelector(`[data-hour="${selectedH}"]`) as HTMLElement | null;
            btn?.scrollIntoView({ block: "nearest" });
        }
        if (selectedM !== null && minuteListRef.current) {
            const btn = minuteListRef.current.querySelector(`[data-min="${selectedM}"]`) as HTMLElement | null;
            btn?.scrollIntoView({ block: "nearest" });
        }
    }, [selectedH, selectedM]);

    useEffect(() => {
        if (open) setTimeout(scrollToSelected, 30);
    }, [open, scrollToSelected]);

    const setHour = (hour: number) => {
        const m = selectedM ?? 0;
        onChange(`${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };

    const setMinute = (minute: number) => {
        const h = selectedH ?? 0;
        onChange(`${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        setOpen(false);
    };

    return (
        <div ref={ref} className={cn("relative", className)}>
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    "flex h-10 w-full items-center gap-2 rounded-[var(--radius-default)] border border-input bg-surface px-3 py-2 text-sm transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    displayValue ? "text-text-dark" : "text-text-muted",
                )}
            >
                <Clock className="h-4 w-4 shrink-0 text-text-muted" />
                <span className="flex-1 text-start">{displayValue || placeholder}</span>
            </button>

            {open && (
                <div className="absolute z-50 mt-2 rounded-[var(--radius-default)] border border-border bg-popover shadow-xl overflow-hidden animate-scale-in w-48">
                    <div className="flex">
                        <div className="flex flex-col w-1/2">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-muted/50 text-center">
                                Hour
                            </div>
                            <div ref={hourListRef} className="h-52 overflow-y-auto scrollbar-thin">
                                {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                                    const ampm = hour >= 12 ? "PM" : "AM";
                                    const h12 = hour % 12 || 12;
                                    return (
                                        <button
                                            key={hour}
                                            data-hour={hour}
                                            type="button"
                                            onClick={() => setHour(hour)}
                                            className={cn(
                                                "w-full px-4 py-1.5 text-sm text-start whitespace-nowrap transition-colors",
                                                selectedH === hour
                                                    ? "bg-primary text-primary-foreground font-medium"
                                                    : "hover:bg-muted text-text-dark",
                                            )}
                                        >
                                            {String(h12).padStart(2, "0")} {ampm}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col w-1/2 border-l border-border">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-muted/50 text-center">
                                Min
                            </div>
                            <div ref={minuteListRef} className="h-52 overflow-y-auto scrollbar-thin">
                                {MINUTES.map((minute) => (
                                    <button
                                        key={minute}
                                        data-min={minute}
                                        type="button"
                                        onClick={() => setMinute(minute)}
                                        className={cn(
                                            "w-full px-4 py-1.5 text-sm text-start whitespace-nowrap transition-colors",
                                            selectedM === minute
                                                ? "bg-primary text-primary-foreground font-medium"
                                                : "hover:bg-muted text-text-dark",
                                        )}
                                    >
                                        :{String(minute).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
