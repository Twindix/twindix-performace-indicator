import { Card, CardContent } from "@/atoms";
import { commentsConstants } from "@/constants/comments";
import { t } from "@/hooks";
import type { CommentsFiltersPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn } from "@/utils";

export const CommentsFilters = ({ mentionFilter, responseFilter, users, count, compact, handlers }: CommentsFiltersPropsInterface) => (
    <Card className={cn(compact ? "mb-3" : "mb-6")}>
        <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
                <Select value={mentionFilter} onValueChange={handlers.onMentionChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t("Filter by mention")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Mentions")}</SelectItem>
                        {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={responseFilter} onValueChange={handlers.onResponseChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t("Response status")} />
                    </SelectTrigger>
                    <SelectContent>
                        {commentsConstants.responseStatusOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {(mentionFilter !== "all" || responseFilter !== "all") && (
                    <button onClick={handlers.onClear} className="text-xs text-text-muted hover:text-text-dark underline">
                        {t("Clear filters")}
                    </button>
                )}

                <span className="ms-auto text-xs text-text-muted">
                    {count} {t("comments")}
                </span>
            </div>
        </CardContent>
    </Card>
);
