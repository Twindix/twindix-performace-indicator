import { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseDate(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DatePicker({ value, onChange, min, max, placeholder = "Pick a date", className, disabled, id }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = parseDate(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewing, setViewing] = useState(() => {
        const d = selected ?? today;
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const prevMonth = () =>
        setViewing((v) => ({ year: v.month === 0 ? v.year - 1 : v.year, month: v.month === 0 ? 11 : v.month - 1 }));
    const nextMonth = () =>
        setViewing((v) => ({ year: v.month === 11 ? v.year + 1 : v.year, month: v.month === 11 ? 0 : v.month + 1 }));

    const pick = (day: number) => {
        onChange(toISO(new Date(viewing.year, viewing.month, day)));
        setOpen(false);
    };

    const isDayDisabled = (day: number): boolean => {
        const iso = toISO(new Date(viewing.year, viewing.month, day));
        return (!!min && iso < min) || (!!max && iso > max);
    };

    const firstDay = new Date(viewing.year, viewing.month, 1).getDay();
    const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const displayValue = selected
        ? selected.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "";

    const todayISO = toISO(today);

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
                <span className="flex-1 text-start">{displayValue || placeholder}</span>
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-72 rounded-[var(--radius-default)] border border-border bg-popover p-3 shadow-xl animate-scale-in">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 text-text-secondary" />
                        </button>
                        <span className="text-sm font-semibold text-text-dark">
                            {MONTHS[viewing.month]} {viewing.year}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                        >
                            <ChevronRight className="h-4 w-4 text-text-secondary" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map((d) => (
                            <div key={d} className="flex h-8 items-center justify-center text-[11px] font-medium text-text-muted">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-0.5">
                        {cells.map((day, i) => {
                            if (day === null) return <div key={`e-${i}`} />;
                            const iso = toISO(new Date(viewing.year, viewing.month, day));
                            const isSelected = value === iso;
                            const isToday = todayISO === iso;
                            const disabledDay = isDayDisabled(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    disabled={disabledDay}
                                    onClick={() => pick(day)}
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

                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => { onChange(todayISO); setOpen(false); }}
                            disabled={isDayDisabled(today.getDate()) && toISO(today) !== todayISO}
                            className="text-xs text-primary hover:underline disabled:opacity-40"
                        >
                            Today
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => { onChange(""); setOpen(false); }}
                                className="text-xs text-text-muted hover:text-error transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
