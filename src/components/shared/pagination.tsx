import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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

const pad = (n: number, width: number) => String(n).padStart(width, "0");

interface NavArrowProps {
    onClick: () => void;
    disabled?: boolean;
    "aria-label": string;
    children: ReactNode;
}

const NavArrow = ({ onClick, disabled, children, ...rest }: NavArrowProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        className={cn(
            "group/arrow inline-flex h-9 w-9 items-center justify-center rounded-sm",
            "text-text-dark transition-all duration-200 cursor-pointer",
            "hover:bg-primary hover:text-primary-foreground",
            "active:scale-90",
            "disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
    >
        {children}
    </button>
);

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
    const padWidth = Math.max(2, String(last).length);

    if (!meta || total === 0) return null;

    const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
    const NextIcon = isRTL ? ChevronLeft : ChevronRight;

    const goTo = (page: number) => {
        if (page < 1 || page > last || page === current || isLoading) return;
        onPageChange(page);
    };

    const showControls = last > 1;
    const progressPct = Math.min(100, Math.max(0, (current / last) * 100));

    return (
        <nav
            aria-label={t("Pagination")}
            className={cn(
                "relative flex flex-col gap-4 pt-5 mt-2",
                "sm:flex-row sm:items-end sm:justify-between sm:gap-8",
                isLoading && "opacity-60 pointer-events-none",
                className,
            )}
        >
            {/* Top hairline + accent ramp */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-border/70" />
            <span
                aria-hidden
                className="absolute top-0 h-px bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%`, [isRTL ? "right" : "left"]: 0 }}
            />

            {/* LEFT — frame counter */}
            <div className="flex items-stretch gap-3">
                <span aria-hidden className="w-[3px] rounded-full bg-primary/90 shadow-[0_0_12px_-2px] shadow-primary/50" />
                <div className="flex flex-col justify-between gap-1">
                    <div className="flex items-baseline gap-1.5 leading-none">
                        <span className="font-mono tabular-nums font-black tracking-[-0.04em] text-[34px] sm:text-[38px] text-text-dark">
                            {pad(current, padWidth)}
                        </span>
                        <span className="font-mono tabular-nums text-text-muted/50 text-lg">/</span>
                        <span className="font-mono tabular-nums font-bold text-text-muted text-lg">
                            {pad(last, padWidth)}
                        </span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-semibold whitespace-nowrap">
                        <span className="text-text-dark tabular-nums">{from}</span>
                        <span className="mx-1 text-text-muted/40">→</span>
                        <span className="text-text-dark tabular-nums">{to}</span>
                        <span className="mx-2 text-text-muted/40">·</span>
                        <span className="text-text-dark tabular-nums">{total}</span>
                        <span className="ms-1.5">{t("items")}</span>
                    </p>
                </div>
            </div>

            {/* CENTER — typographic page strip */}
            {showControls && (
                <div className="flex items-center gap-1 sm:gap-1.5">
                    <NavArrow onClick={() => goTo(current - 1)} disabled={current === 1} aria-label={t("Previous page")}>
                        <PrevIcon className="h-4 w-4 transition-transform group-hover/arrow:-translate-x-0.5" />
                    </NavArrow>

                    <ol className="flex items-end" role="list">
                        {pages.map((p, idx) => {
                            if (p === "dots") {
                                return (
                                    <li
                                        key={`dots-${idx}`}
                                        aria-hidden
                                        className="inline-flex h-9 min-w-7 items-end justify-center pb-2 text-sm text-text-muted/50 font-mono select-none"
                                    >
                                        ··
                                    </li>
                                );
                            }
                            const isActive = p === current;
                            return (
                                <li key={p}>
                                    <button
                                        type="button"
                                        onClick={() => goTo(p)}
                                        aria-current={isActive ? "page" : undefined}
                                        aria-label={`${t("Page")} ${p}`}
                                        className={cn(
                                            "group/page relative inline-flex h-9 min-w-9 items-center justify-center px-2",
                                            "text-sm font-mono tabular-nums font-bold tracking-tight",
                                            "transition-all duration-200 cursor-pointer rounded-sm",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                            isActive
                                                ? "text-primary"
                                                : "text-text-muted/60 hover:text-text-dark",
                                        )}
                                    >
                                        <span className="relative">{p}</span>

                                        {/* Active underline — chunky primary bar */}
                                        {isActive && (
                                            <span
                                                aria-hidden
                                                className="absolute inset-x-1.5 -bottom-px h-[3px] rounded-full bg-primary"
                                                style={{ boxShadow: "0 6px 12px -4px var(--color-primary, currentColor)" }}
                                            />
                                        )}

                                        {/* Hover ghost underline */}
                                        {!isActive && (
                                            <span
                                                aria-hidden
                                                className="absolute inset-x-1.5 -bottom-px h-[2px] rounded-full bg-text-muted/40 scale-x-0 origin-center transition-transform duration-200 group-hover/page:scale-x-100"
                                            />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    <NavArrow onClick={() => goTo(current + 1)} disabled={current === last} aria-label={t("Next page")}>
                        <NextIcon className="h-4 w-4 transition-transform group-hover/arrow:translate-x-0.5" />
                    </NavArrow>
                </div>
            )}

            {/* RIGHT — rows-per-page chip */}
            {onPerPageChange ? (
                <label className="flex items-center justify-end gap-2.5 whitespace-nowrap">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-semibold">
                        {t("Rows")}
                    </span>
                    <span className="relative inline-flex items-center">
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            disabled={isLoading}
                            aria-label={t("Rows per page")}
                            className={cn(
                                "appearance-none h-8 ps-3 pe-8 rounded-sm",
                                "bg-transparent border border-border/70",
                                "text-text-dark text-xs font-mono tabular-nums font-bold",
                                "cursor-pointer transition-all duration-200",
                                "hover:border-primary/60 hover:bg-primary/5",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                            )}
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown
                            aria-hidden
                            className="absolute end-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted pointer-events-none"
                        />
                    </span>
                </label>
            ) : (
                <span aria-hidden className="hidden sm:block w-px" />
            )}
        </nav>
    );
};
