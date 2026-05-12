import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { t, useSettings } from "@/hooks";
import type { PaginationMetaInterface } from "@/interfaces";
import { cn } from "@/utils";

const DEFAULT_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const SIBLINGS = 1;
const BOUNDARIES = 1;

type PageItem = number | "dots";

const buildPageWindow = (current: number, last: number): PageItem[] => {
    if (last <= 1) return [1];
    const total = SIBLINGS * 2 + BOUNDARIES * 2 + 3;
    if (last <= total) return Array.from({ length: last }, (_, i) => i + 1);

    const leftSibling = Math.max(current - SIBLINGS, BOUNDARIES + 2);
    const rightSibling = Math.min(current + SIBLINGS, last - BOUNDARIES - 1);
    const showLeftDots = leftSibling > BOUNDARIES + 2;
    const showRightDots = rightSibling < last - BOUNDARIES - 1;

    const pages: PageItem[] = [];
    for (let i = 1; i <= BOUNDARIES; i += 1) pages.push(i);
    if (showLeftDots) pages.push("dots");
    else for (let i = BOUNDARIES + 1; i < leftSibling; i += 1) pages.push(i);
    for (let i = leftSibling; i <= rightSibling; i += 1) pages.push(i);
    if (showRightDots) pages.push("dots");
    else for (let i = rightSibling + 1; i <= last - BOUNDARIES; i += 1) pages.push(i);
    for (let i = last - BOUNDARIES + 1; i <= last; i += 1) pages.push(i);
    return pages;
};

interface NavButtonProps {
    onClick: () => void;
    disabled?: boolean;
    "aria-label": string;
    children: ReactNode;
}

const NavButton = ({ onClick, disabled, children, ...rest }: NavButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
            "text-text-muted hover:text-text-dark hover:bg-card",
            "active:scale-90",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "cursor-pointer",
        )}
    >
        {children}
    </button>
);

const Divider = () => <span aria-hidden className="mx-0.5 h-4 w-px bg-border/70 shrink-0" />;

export interface PaginationProps {
    meta: PaginationMetaInterface | null;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    isLoading?: boolean;
    className?: string;
}

export const Pagination = ({
    meta,
    onPageChange,
    onPerPageChange,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
    isLoading = false,
    className,
}: PaginationProps) => {
    const [settings] = useSettings();
    const isRTL = settings.language === "ar";

    const current = meta?.current_page ?? 1;
    const last = meta?.last_page ?? 1;
    const total = meta?.total ?? 0;
    const from = meta?.from ?? 0;
    const to = meta?.to ?? 0;
    const perPage = meta?.per_page ?? perPageOptions[0];

    const pages = useMemo(() => buildPageWindow(current, last), [current, last]);

    if (!meta || total === 0) return null;

    const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
    const NextIcon = isRTL ? ChevronLeft : ChevronRight;
    const FirstIcon = isRTL ? ChevronsRight : ChevronsLeft;
    const LastIcon = isRTL ? ChevronsLeft : ChevronsRight;

    const goTo = (page: number) => {
        if (page < 1 || page > last || page === current || isLoading) return;
        onPageChange(page);
    };

    const showControls = last > 1;

    return (
        <nav
            aria-label={t("Pagination")}
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 py-4",
                isLoading && "opacity-70 pointer-events-none",
                className,
            )}
        >
            {/* Range counter — typographic label */}
            <p className="flex items-baseline gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-text-muted whitespace-nowrap tabular-nums">
                <span>{t("Showing")}</span>
                <span className="text-text-dark font-semibold normal-case tracking-normal text-xs">{from}</span>
                <span className="text-text-muted/60">–</span>
                <span className="text-text-dark font-semibold normal-case tracking-normal text-xs">{to}</span>
                <span className="ms-1.5 normal-case tracking-normal">{t("of")}</span>
                <span className="text-text-dark font-semibold normal-case tracking-normal text-xs">{total}</span>
            </p>

            {/* Floating capsule with nav controls */}
            {showControls && (
                <div
                    className={cn(
                        "inline-flex items-center gap-0.5 rounded-full",
                        "bg-muted/40 border border-border/60",
                        "p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_16px_-12px_rgba(0,0,0,0.08)]",
                    )}
                >
                    <NavButton onClick={() => goTo(1)} disabled={current === 1} aria-label={t("First page")}>
                        <FirstIcon className="h-3.5 w-3.5" />
                    </NavButton>
                    <NavButton onClick={() => goTo(current - 1)} disabled={current === 1} aria-label={t("Previous page")}>
                        <PrevIcon className="h-3.5 w-3.5" />
                    </NavButton>

                    <Divider />

                    {pages.map((p, idx) => {
                        if (p === "dots") {
                            return (
                                <span
                                    key={`dots-${idx}`}
                                    aria-hidden
                                    className="inline-flex h-7 min-w-7 items-center justify-center text-text-muted/70 text-xs select-none"
                                >
                                    ⋯
                                </span>
                            );
                        }
                        const isActive = p === current;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => goTo(p)}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={`${t("Page")} ${p}`}
                                className={cn(
                                    "relative inline-flex h-7 min-w-7 items-center justify-center px-2 rounded-full text-xs font-semibold tabular-nums",
                                    "transition-all duration-200 cursor-pointer",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-[0_2px_6px_-2px_rgba(0,0,0,0.2)] scale-[1.04]"
                                        : "text-text-dark hover:bg-card hover:text-primary active:scale-95",
                                )}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <Divider />

                    <NavButton onClick={() => goTo(current + 1)} disabled={current === last} aria-label={t("Next page")}>
                        <NextIcon className="h-3.5 w-3.5" />
                    </NavButton>
                    <NavButton onClick={() => goTo(last)} disabled={current === last} aria-label={t("Last page")}>
                        <LastIcon className="h-3.5 w-3.5" />
                    </NavButton>
                </div>
            )}

            {/* Per-page selector — chip style */}
            {onPerPageChange ? (
                <label className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase text-text-muted whitespace-nowrap">
                    <span>{t("Rows")}</span>
                    <span className="relative inline-flex items-center">
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            disabled={isLoading}
                            aria-label={t("Rows per page")}
                            className={cn(
                                "appearance-none h-7 ps-3 pe-7 rounded-full",
                                "bg-muted/40 border border-border/60",
                                "text-text-dark text-xs font-semibold tabular-nums normal-case tracking-normal",
                                "cursor-pointer transition-colors duration-200",
                                "hover:bg-muted hover:border-border",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                            )}
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown aria-hidden className="absolute end-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted pointer-events-none" />
                    </span>
                </label>
            ) : (
                /* Spacer to keep the nav centered when there's no per-page selector */
                <span aria-hidden className="hidden sm:block w-[1px]" />
            )}
        </nav>
    );
};
