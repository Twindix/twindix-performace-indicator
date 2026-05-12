import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/atoms";
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
    if (last <= total) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
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
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 py-3", className)}>
            <p className="text-xs text-text-muted">
                {t("Showing")} <span className="font-semibold text-text-dark">{from ?? 0}</span>
                {"–"}
                <span className="font-semibold text-text-dark">{to ?? 0}</span>{" "}
                {t("of")} <span className="font-semibold text-text-dark">{total}</span>
            </p>

            {showControls && (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => goTo(1)} disabled={current === 1 || isLoading} aria-label={t("First page")} className="h-8 w-8">
                        <FirstIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => goTo(current - 1)} disabled={current === 1 || isLoading} aria-label={t("Previous page")} className="h-8 w-8">
                        <PrevIcon className="h-4 w-4" />
                    </Button>

                    {pages.map((p, idx) => {
                        if (p === "dots") {
                            return <span key={`dots-${idx}`} className="px-2 text-text-muted text-sm select-none">…</span>;
                        }
                        const isActive = p === current;
                        return (
                            <Button
                                key={p}
                                variant={isActive ? "default" : "ghost"}
                                size="sm"
                                onClick={() => goTo(p)}
                                disabled={isLoading}
                                aria-current={isActive ? "page" : undefined}
                                className={cn("h-8 min-w-8 px-2", !isActive && "text-text-dark")}
                            >
                                {p}
                            </Button>
                        );
                    })}

                    <Button variant="ghost" size="icon" onClick={() => goTo(current + 1)} disabled={current === last || isLoading} aria-label={t("Next page")} className="h-8 w-8">
                        <NextIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => goTo(last)} disabled={current === last || isLoading} aria-label={t("Last page")} className="h-8 w-8">
                        <LastIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {onPerPageChange && (
                <div className="flex items-center gap-2">
                    <label htmlFor="per-page" className="text-xs text-text-muted">{t("Rows per page")}</label>
                    <select
                        id="per-page"
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        disabled={isLoading}
                        className="h-8 rounded-md border border-border bg-card text-text-dark text-xs px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                        {perPageOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};
