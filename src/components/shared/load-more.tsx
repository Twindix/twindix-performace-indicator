import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

const COLORS = {
    surface: "#111a2e",
    elevated: "#16223a",
    elevated2: "#1c2a45",
    border: "#243352",
    borderSoft: "#1d2a44",
    textPrimary: "#e6ecf7",
    textMuted: "#8a99b8",
    textFaint: "#5d6a86",
    accent: "#4f8cff",
    accentStrong: "#3b76f0",
    accentLight: "#6aa3ff",
    accentSoft: "rgba(79,140,255,0.14)",
    accentGlow: "rgba(79,140,255,0.35)",
};

const FONT_STACK = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ── Icons (inline so the component has no external icon dep) ────────────────
const ArrowRightIcon = () => (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

const ChevronDownIcon = ({ open = false }: { open?: boolean }) => (
    <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ transition: "transform .18s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
        <path d="M6 9l6 6 6-6" />
    </svg>
);

// ── Step option (one row inside the popover) ────────────────────────────────
interface StepOptionProps {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}

const StepOption = ({ active, onClick, children }: StepOptionProps) => {
    const [hover, setHover] = useState(false);
    const bg = active ? COLORS.accentSoft : hover ? "rgba(255,255,255,0.04)" : "transparent";
    const color = active ? COLORS.accent : COLORS.textPrimary;

    return (
        <button
            type="button"
            role="option"
            aria-selected={active}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: "block",
                width: "100%",
                padding: "8px 10px",
                background: bg,
                border: 0,
                borderRadius: 6,
                color,
                fontFamily: FONT_STACK,
                fontSize: 13,
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
                textAlign: "left",
                cursor: "pointer",
                transition: "background-color .12s ease, color .12s ease",
            }}
        >
            {children}
        </button>
    );
};

// ── Step dropdown (Per-page selector with up-pop popover) ───────────────────
interface StepDropdownProps {
    value: number;
    options: number[];
    onChange: (next: number) => void;
}

const StepDropdown = ({ value, options, onChange }: StepDropdownProps) => {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onMouseDown = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const triggerBorder = open ? COLORS.border : hover ? COLORS.border : COLORS.borderSoft;

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Rows per page"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    padding: "0 10px 0 12px",
                    background: COLORS.elevated,
                    border: `1px solid ${triggerBorder}`,
                    borderRadius: 10,
                    color: COLORS.textPrimary,
                    fontFamily: FONT_STACK,
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    cursor: "pointer",
                    transition: "border-color .15s ease, background-color .15s ease",
                }}
            >
                <span>{value}</span>
                <ChevronDownIcon open={open} />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Rows per page"
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        right: 0,
                        minWidth: 120,
                        padding: 4,
                        background: COLORS.elevated2,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 10,
                        boxShadow: "0 12px 28px rgba(0,0,0,.45)",
                        zIndex: 50,
                    }}
                >
                    {options.map((opt) => (
                        <StepOption
                            key={opt}
                            active={opt === value}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            {opt}
                        </StepOption>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main component ──────────────────────────────────────────────────────────
export interface LoadMoreProps {
    page: number;
    total: number;
    pageSize: number;
    onPage: (page: number) => void;
    onPageSize?: (pageSize: number) => void;
    pageSizes?: number[];
    label?: string;
    className?: string;
    style?: CSSProperties;
}

export const LoadMore = ({
    page,
    total,
    pageSize,
    onPage,
    onPageSize,
    pageSizes = [10, 20, 50, 100],
    label = "projects",
    className,
    style,
}: LoadMoreProps) => {
    const loaded = Math.min(page * pageSize, Math.max(0, total));
    const progress = total === 0 ? 0 : (loaded / total) * 100;
    const isComplete = loaded >= total && total > 0;
    const isFirstPage = page <= 1;

    const [resetHover, setResetHover] = useState(false);
    const [resetPressed, setResetPressed] = useState(false);
    const [loadHover, setLoadHover] = useState(false);
    const [loadPressed, setLoadPressed] = useState(false);

    const handleReset = () => {
        if (isFirstPage) return;
        onPage(1);
    };

    const handleLoadMore = () => {
        if (isComplete) return;
        onPage(page + 1);
    };

    const handleStepChange = (next: number) => {
        onPageSize?.(next);
        onPage(1);
    };

    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                fontFamily: FONT_STACK,
                color: COLORS.textPrimary,
                ...style,
            }}
        >
            {/* Status line */}
            <p
                style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 400,
                    color: COLORS.textMuted,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: 0.05,
                }}
            >
                You've viewed{" "}
                <strong style={{ color: COLORS.textPrimary, fontWeight: 600 }}>{loaded}</strong>
                {" "}of{" "}
                <strong style={{ color: COLORS.textPrimary, fontWeight: 600 }}>{total}</strong>
                {" "}{label}
            </p>

            {/* Progress bar */}
            <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total || 1}
                aria-valuenow={loaded}
                style={{
                    width: 280,
                    height: 4,
                    borderRadius: 2,
                    background: COLORS.borderSoft,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                        transition: "width .35s cubic-bezier(.2,.7,.2,1)",
                    }}
                />
            </div>

            {/* Actions row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                {/* Reset */}
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={isFirstPage}
                    onMouseEnter={() => setResetHover(true)}
                    onMouseLeave={() => {
                        setResetHover(false);
                        setResetPressed(false);
                    }}
                    onMouseDown={() => setResetPressed(true)}
                    onMouseUp={() => setResetPressed(false)}
                    style={{
                        height: 40,
                        padding: "0 14px",
                        background: isFirstPage
                            ? "transparent"
                            : resetPressed
                                ? "rgba(255,255,255,0.06)"
                                : resetHover
                                    ? "rgba(255,255,255,0.03)"
                                    : "transparent",
                        border: `1px solid ${!isFirstPage && resetHover ? COLORS.border : COLORS.borderSoft}`,
                        borderRadius: 10,
                        color: COLORS.textMuted,
                        fontFamily: FONT_STACK,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: isFirstPage ? "not-allowed" : "pointer",
                        opacity: isFirstPage ? 0.5 : 1,
                        transition: "border-color .15s ease, background-color .15s ease, color .15s ease",
                    }}
                >
                    Reset
                </button>

                {/* Load more / All caught up — primary CTA (pill) */}
                <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isComplete}
                    onMouseEnter={() => setLoadHover(true)}
                    onMouseLeave={() => {
                        setLoadHover(false);
                        setLoadPressed(false);
                    }}
                    onMouseDown={() => setLoadPressed(true)}
                    onMouseUp={() => setLoadPressed(false)}
                    aria-label={isComplete ? "All caught up" : `Load ${pageSize} more ${label}`}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        height: 40,
                        padding: "0 22px",
                        background: isComplete
                            ? COLORS.elevated
                            : loadPressed
                                ? COLORS.accentStrong
                                : loadHover
                                    ? COLORS.accentStrong
                                    : COLORS.accent,
                        border: 0,
                        borderRadius: 999,
                        color: isComplete ? COLORS.textFaint : "#ffffff",
                        fontFamily: FONT_STACK,
                        fontSize: 13.5,
                        fontWeight: 600,
                        letterSpacing: 0.1,
                        boxShadow: isComplete
                            ? "none"
                            : loadHover
                                ? `0 10px 28px ${COLORS.accentGlow}, 0 0 22px rgba(79,140,255,0.35)`
                                : `0 6px 20px ${COLORS.accentGlow}, 0 0 14px rgba(79,140,255,0.28)`,
                        cursor: isComplete ? "not-allowed" : "pointer",
                        transform: !isComplete && loadHover ? "translateY(-1px)" : "translateY(0)",
                        transition: "background-color .15s ease, box-shadow .2s ease, transform .12s ease, color .15s ease",
                    }}
                >
                    {isComplete ? (
                        <span>All caught up</span>
                    ) : (
                        <>
                            <span>Load {pageSize} more</span>
                            <ArrowRightIcon />
                        </>
                    )}
                </button>

                {/* Step label + dropdown (omitted when onPageSize not provided) */}
                {onPageSize && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <span
                            style={{
                                color: COLORS.textMuted,
                                fontFamily: FONT_STACK,
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            Step
                        </span>
                        <StepDropdown value={pageSize} options={pageSizes} onChange={handleStepChange} />
                    </div>
                )}
            </div>
        </div>
    );
};
