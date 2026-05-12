import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

interface ArrowButtonProps {
    onClick: () => void;
    disabled?: boolean;
    "aria-label": string;
    children: ReactNode;
}

const ArrowButton = ({ onClick, disabled, children, ...rest }: ArrowButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md",
            "text-text-muted transition-colors duration-150 cursor-pointer",
            "hover:text-text-dark hover:bg-card",
            "disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
    >
        {children}
    </button>
);

interface NumberButtonProps {
    onClick: () => void;
    active?: boolean;
    "aria-current"?: "page" | undefined;
    "aria-label": string;
    children: ReactNode;
}

const NumberButton = ({ onClick, active, children, ...rest }: NumberButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        aria-current={rest["aria-current"]}
        aria-label={rest["aria-label"]}
        className={cn(
            "inline-flex h-8 min-w-8 items-center justify-center px-2.5 rounded-md",
            "text-sm font-medium tabular-nums transition-colors duration-150 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:z-10",
            active
                ? "bg-text-dark text-surface shadow-sm"
                : "bg-card text-text-dark border border-border hover:bg-muted",
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
                "flex flex-col gap-3 py-4",
                "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                isLoading && "opacity-70 pointer-events-none",
                className,
            )}
        >
            {/* Range counter */}
            <p className="text-sm text-text-muted whitespace-nowrap">
                {t("Showing")} <span className="font-semibold text-text-dark tabular-nums">{from}</span>
                {" "}{t("to")}{" "}
                <span className="font-semibold text-text-dark tabular-nums">{to}</span>
                {" "}{t("of")}{" "}
                <span className="font-semibold text-text-dark tabular-nums">{total}</span>
                {" "}{t("results")}
            </p>

            {/* The pagination strip — pill container with bare arrows + bordered number squares */}
            {showControls && (
                <div className="inline-flex items-center gap-1 rounded-xl bg-muted/40 px-1.5 py-1">
                    <ArrowButton onClick={() => goTo(1)} disabled={current === 1} aria-label={t("First page")}>
                        <FirstIcon className="h-4 w-4" />
                    </ArrowButton>
                    <ArrowButton onClick={() => goTo(current - 1)} disabled={current === 1} aria-label={t("Previous page")}>
                        <PrevIcon className="h-4 w-4" />
                    </ArrowButton>

                    {pages.map((p, idx) => {
                        if (p === "dots") {
                            return (
                                <span
                                    key={`dots-${idx}`}
                                    aria-hidden
                                    className="inline-flex h-8 min-w-6 items-center justify-center text-sm text-text-muted select-none"
                                >
                                    …
                                </span>
                            );
                        }
                        const isActive = p === current;
                        return (
                            <NumberButton
                                key={p}
                                onClick={() => goTo(p)}
                                active={isActive}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={`${t("Page")} ${p}`}
                            >
                                {p}
                            </NumberButton>
                        );
                    })}

                    <ArrowButton onClick={() => goTo(current + 1)} disabled={current === last} aria-label={t("Next page")}>
                        <NextIcon className="h-4 w-4" />
                    </ArrowButton>
                    <ArrowButton onClick={() => goTo(last)} disabled={current === last} aria-label={t("Last page")}>
                        <LastIcon className="h-4 w-4" />
                    </ArrowButton>
                </div>
            )}

            {/* Rows per page */}
            {onPerPageChange ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <label htmlFor="rows-per-page" className="text-sm text-text-muted">
                        {t("Rows per page")}
                    </label>
                    <select
                        id="rows-per-page"
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        disabled={isLoading}
                        className={cn(
                            "h-8 px-2 rounded-md border border-border bg-card",
                            "text-sm text-text-dark tabular-nums cursor-pointer",
                            "hover:bg-muted transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                        )}
                    >
                        {perPageOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <span aria-hidden className="hidden sm:block w-px" />
            )}
        </nav>
    );
};
