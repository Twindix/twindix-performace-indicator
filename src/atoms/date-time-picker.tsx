import { useState, useRef, useEffect, useCallback } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/utils";

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    min?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function parseDateTime(s: string): { date: string; h: number; m: number } | null {
    if (!s) return null;
    const [date, time] = s.split("T");
    if (!date || !time) return null;
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return { date, h, m };
}

function toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(date: string, h: number, m: number): string {
    const d = new Date(date + "T00:00:00");
    const dateStr = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${dateStr} · ${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function DateTimePicker({ value, onChange, min, placeholder = "Pick date & time", className, disabled, id }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"date" | "time">("date");
    const ref = useRef<HTMLDivElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const parsed = parseDateTime(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewing, setViewing] = useState(() => {
        if (parsed) {
            const d = new Date(parsed.date + "T00:00:00");
            return { year: d.getFullYear(), month: d.getMonth() };
        }
        return { year: today.getFullYear(), month: today.getMonth() };
    });

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const scrollToSelected = useCallback(() => {
        if (parsed?.h !== undefined && hourListRef.current) {
            const btn = hourListRef.current.querySelector(`[data-hour="${parsed.h}"]`) as HTMLElement | null;
            btn?.scrollIntoView({ block: "nearest" });
        }
    }, [parsed?.h]);

    useEffect(() => {
        if (open && tab === "time") setTimeout(scrollToSelected, 30);
    }, [open, tab, scrollToSelected]);

    const prevMonth = () =>
        setViewing((v) => ({ year: v.month === 0 ? v.year - 1 : v.year, month: v.month === 0 ? 11 : v.month - 1 }));
    const nextMonth = () =>
        setViewing((v) => ({ year: v.month === 11 ? v.year + 1 : v.year, month: v.month === 11 ? 0 : v.month + 1 }));

    const pickDate = (day: number) => {
        const iso = toISO(new Date(viewing.year, viewing.month, day));
        const h = parsed?.h ?? 9;
        const m = parsed?.m ?? 0;
        onChange(`${iso}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        setTab("time");
    };

    const setHour = (hour: number) => {
        const date = parsed?.date ?? toISO(today);
        const m = parsed?.m ?? 0;
        onChange(`${date}T${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };

    const setMinute = (minute: number) => {
        const date = parsed?.date ?? toISO(today);
        const h = parsed?.h ?? 9;
        onChange(`${date}T${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        setOpen(false);
    };

    const isDayDisabled = (day: number): boolean => {
        const iso = toISO(new Date(viewing.year, viewing.month, day));
        return !!min && iso < min.split("T")[0];
    };

    const firstDay = new Date(viewing.year, viewing.month, 1).getDay();
    const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const todayISO = toISO(today);
    const displayValue = parsed ? formatDisplay(parsed.date, parsed.h, parsed.m) : "";

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
                <CalendarIcon className="h-4 w-4 shrink-0 text-text-muted" />
                <span className="flex-1 text-start truncate">{displayValue || placeholder}</span>
            </button>

            {open && (
                <div className="absolute z-50 mt-2 rounded-[var(--radius-default)] border border-border bg-popover shadow-xl overflow-hidden animate-scale-in">
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            type="button"
                            onClick={() => setTab("date")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
                                tab === "date" ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-dark",
                            )}
                        >
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Date
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("time")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
                                tab === "time" ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-dark",
                            )}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            Time
                        </button>
                    </div>

                    {tab === "date" && (
                        <div className="p-3 w-72">
                            <div className="flex items-center justify-between mb-3">
                                <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors">
                                    <ChevronLeft className="h-4 w-4 text-text-secondary" />
                                </button>
                                <span className="text-sm font-semibold text-text-dark">{MONTHS[viewing.month]} {viewing.year}</span>
                                <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors">
                                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 mb-1">
                                {DAYS.map((d) => (
                                    <div key={d} className="flex h-8 items-center justify-center text-[11px] font-medium text-text-muted">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-y-0.5">
                                {cells.map((day, i) => {
                                    if (day === null) return <div key={`e-${i}`} />;
                                    const iso = toISO(new Date(viewing.year, viewing.month, day));
                                    const isSelected = parsed?.date === iso;
                                    const isToday = todayISO === iso;
                                    const disabledDay = isDayDisabled(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            disabled={disabledDay}
                                            onClick={() => pickDate(day)}
                                            className={cn(
                                                "flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors",
                                                "disabled:cursor-not-allowed disabled:opacity-30",
                                                isSelected && "bg-primary text-primary-foreground font-semibold shadow-sm",
                                                !isSelected && isToday && "border border-primary text-primary font-medium",
                                                !isSelected && !disabledDay && "hover:bg-muted text-text-dark",
                                                !isSelected && disabledDay && "text-text-muted",
                                            )}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tab === "time" && (
                        <div className="flex">
                            <div className="flex flex-col min-w-0">
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-muted/50 text-center">Hour</div>
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
                                                    parsed?.h === hour ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-text-dark",
                                                )}
                                            >
                                                {String(h12).padStart(2, "0")} {ampm}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0 border-l border-border">
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-muted/50 text-center">Min</div>
                                <div ref={minuteListRef} className="h-52 overflow-y-auto scrollbar-thin">
                                    {MINUTES.map((minute) => (
                                        <button
                                            key={minute}
                                            type="button"
                                            onClick={() => setMinute(minute)}
                                            className={cn(
                                                "w-full px-4 py-1.5 text-sm text-start whitespace-nowrap transition-colors",
                                                parsed?.m === minute ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-text-dark",
                                            )}
                                        >
                                            :{String(minute).padStart(2, "0")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
