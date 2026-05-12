import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { Input } from "@/atoms";
import { t, useSettings } from "@/hooks";
import { cn } from "@/utils";

export interface ComboboxOption {
    value: string;
    label: string;
    hint?: string;
    icon?: React.ReactNode;
}

export interface ComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    emptyLabel?: string;
    searchPlaceholder?: string;
    allOption?: { value: string; label: string };
    disabled?: boolean;
    className?: string;
    triggerClassName?: string;
}

export const Combobox = ({
    value,
    onValueChange,
    options,
    placeholder,
    emptyLabel,
    searchPlaceholder,
    allOption,
    disabled,
    className,
    triggerClassName,
}: ComboboxProps) => {
    const [settings] = useSettings();
    const isRTL = settings.language === "ar";

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fullOptions = useMemo<ComboboxOption[]>(
        () => (allOption ? [{ value: allOption.value, label: allOption.label }, ...options] : options),
        [options, allOption],
    );

    const filtered = useMemo(() => {
        if (!query.trim()) return fullOptions;
        const q = query.trim().toLowerCase();
        return fullOptions.filter((o) => o.label.toLowerCase().includes(q));
    }, [fullOptions, query]);

    const selected = fullOptions.find((o) => o.value === value);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (open) {
            setActiveIndex(0);
            // Defer focus to next tick so the input is mounted
            queueMicrotask(() => inputRef.current?.focus());
        } else {
            setQuery("");
        }
    }, [open]);

    useEffect(() => {
        if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
    }, [filtered.length, activeIndex]);

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            const item = filtered[activeIndex];
            if (item) {
                onValueChange(item.value);
                setOpen(false);
            }
        }
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => !disabled && setOpen((o) => !o)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    "flex items-center justify-between gap-2 w-full rounded-md border border-border bg-card",
                    "h-9 px-3 text-xs sm:text-sm text-text-dark text-start",
                    "transition-colors hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    open && "ring-2 ring-primary/40",
                    triggerClassName,
                )}
            >
                <span className={cn("truncate flex items-center gap-1.5", !selected && "text-text-muted")}>
                    {selected?.icon}
                    {selected?.label ?? placeholder ?? t("Select...")}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-text-muted shrink-0 opacity-60" />
            </button>

            {open && (
                <div
                    className={cn(
                        "absolute z-50 mt-1.5 w-full min-w-[200px] rounded-lg border border-border bg-card",
                        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] overflow-hidden",
                        "animate-in fade-in-0 zoom-in-95",
                        isRTL ? "end-0" : "start-0",
                    )}
                >
                    <div className="relative border-b border-border">
                        <Search className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted", isRTL ? "end-3" : "start-3")} />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={searchPlaceholder ?? t("Search...")}
                            className={cn("h-9 border-0 rounded-none focus-visible:ring-0 bg-transparent text-xs", isRTL ? "pe-3 ps-9" : "ps-9 pe-3")}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                className={cn("absolute top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark", isRTL ? "start-2" : "end-2")}
                                aria-label={t("Clear search")}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-xs text-text-muted text-center italic">
                                {emptyLabel ?? t("No results")}
                            </li>
                        ) : (
                            filtered.map((opt, idx) => {
                                const isSelected = opt.value === value;
                                const isActive = idx === activeIndex;
                                return (
                                    <li key={opt.value} role="option" aria-selected={isSelected}>
                                        <button
                                            type="button"
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            onClick={() => { onValueChange(opt.value); setOpen(false); }}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-start cursor-pointer transition-colors",
                                                isActive ? "bg-accent text-accent-foreground" : "text-text-dark",
                                                "hover:bg-accent",
                                            )}
                                        >
                                            {opt.icon}
                                            <span className="flex-1 truncate">{opt.label}</span>
                                            {opt.hint && <span className="text-[10px] text-text-muted">{opt.hint}</span>}
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
