import { FiltersBar, SelectField } from "@/components/shared";
import { commentsConstants } from "@/constants/comments";
import { t } from "@/hooks";
import type { CommentsFiltersPropsInterface } from "@/interfaces";

export const CommentsFilters = ({ mentionFilter, responseFilter, users, count, compact, handlers }: CommentsFiltersPropsInterface) => (
    <FiltersBar
        count={count}
        countLabel={t("comments")}
        hasFilters={mentionFilter !== "all" || responseFilter !== "all"}
        onClear={handlers.onClear}
        compact={compact}
    >
        <SelectField
            value={mentionFilter}
            onChange={handlers.onMentionChange}
            options={[{ value: "all", label: t("All Mentions") }, ...users.map((u) => ({ value: u.id, label: u.full_name }))]}
            placeholder={t("Filter by mention")}
            triggerClassName="w-[180px] h-9 text-xs"
        />
        <SelectField
            value={responseFilter}
            onChange={handlers.onResponseChange}
            options={commentsConstants.responseStatusOptions.map((o) => ({ value: o.value, label: t(o.label) }))}
            placeholder={t("Response status")}
            triggerClassName="w-[160px] h-9 text-xs"
        />
    </FiltersBar>
);
