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

interface PageButtonProps {
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    "aria-label"?: string;
    "aria-current"?: "page" | undefined;
    children: ReactNode;
    className?: string;
}

const PageButton = ({ onClick, disabled, active, children, className, ...rest }: PageButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        aria-current={rest["aria-current"]}
        className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center px-3 rounded-md",
            "text-sm font-medium tabular-nums",
            "border transition-colors duration-150 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:z-10",
            active
                ? "bg-text-dark text-surface border-text-dark hover:bg-text-dark"
                : "bg-card text-text-dark border-border hover:bg-muted",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card",
            className,
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

            {/* Page buttons */}
            {showControls && (
                <div className="flex items-center gap-1.5">
                    <PageButton onClick={() => goTo(1)} disabled={current === 1} aria-label={t("First page")} className="px-0">
                        <FirstIcon className="h-4 w-4" />
                    </PageButton>
                    <PageButton onClick={() => goTo(current - 1)} disabled={current === 1} aria-label={t("Previous page")} className="px-0">
                        <PrevIcon className="h-4 w-4" />
                    </PageButton>

                    {pages.map((p, idx) => {
                        if (p === "dots") {
                            return (
                                <span
                                    key={`dots-${idx}`}
                                    aria-hidden
                                    className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-text-muted select-none"
                                >
                                    …
                                </span>
                            );
                        }
                        const isActive = p === current;
                        return (
                            <PageButton
                                key={p}
                                onClick={() => goTo(p)}
                                active={isActive}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={`${t("Page")} ${p}`}
                            >
                                {p}
                            </PageButton>
                        );
                    })}

                    <PageButton onClick={() => goTo(current + 1)} disabled={current === last} aria-label={t("Next page")} className="px-0">
                        <NextIcon className="h-4 w-4" />
                    </PageButton>
                    <PageButton onClick={() => goTo(last)} disabled={current === last} aria-label={t("Last page")} className="px-0">
                        <LastIcon className="h-4 w-4" />
                    </PageButton>
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
                            "h-9 px-2 rounded-md border border-border bg-card",
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
