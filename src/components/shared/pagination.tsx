import type { PaginationMetaInterface } from "@/interfaces";

import { LoadMore } from "./load-more";

export interface PaginationProps {
    meta: PaginationMetaInterface | null;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    isLoading?: boolean;
    className?: string;
    label?: string;
}

/**
 * Thin adapter: maps the existing meta-based API onto the LoadMore visual.
 * All paginated views in the app render this — switching the body here updates
 * every list page at once.
 */
export const Pagination = ({
    meta,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 20, 50, 100],
    isLoading = false,
    className,
    label = "items",
}: PaginationProps) => {
    if (!meta || meta.total === 0) return null;

    return (
        <div
            className={className}
            style={{
                paddingBlock: 24,
                opacity: isLoading ? 0.7 : 1,
                pointerEvents: isLoading ? "none" : "auto",
                transition: "opacity .15s ease",
            }}
        >
            <LoadMore
                page={meta.current_page}
                total={meta.total}
                pageSize={meta.per_page}
                onPage={onPageChange}
                onPageSize={onPerPageChange}
                pageSizes={perPageOptions}
                label={label}
            />
        </div>
    );
};
