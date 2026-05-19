import { useMemo, useState } from "react";
import { Input } from "./input";

interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const Combobox = ({ options, value, onChange, placeholder, disabled, className }: ComboboxProps) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const selected = options.find((o) => o.value === value) ?? null;
    const displayValue = open ? query : (selected?.label ?? "");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20) : options.slice(0, 20);
    }, [options, query]);

    return (
        <div className={`relative ${className ?? ""}`}>
            <Input
                value={displayValue}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => { setQuery(e.target.value); if (selected) onChange(""); setOpen(true); }}
                onFocus={() => { setQuery(""); setOpen(true); }}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
            />
            {open && filtered.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-56 overflow-auto">
                    {filtered.map((o) => (
                        <button
                            key={o.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { onChange(o.value); setQuery(""); setOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer ${o.value === value ? "bg-muted font-medium" : ""}`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
