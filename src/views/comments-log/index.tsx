import { useMemo, useState } from "react";
import { AtSign, MessageCircle, CheckCircle2, Clock, User } from "lucide-react";

import { Badge, Card, CardContent, Input } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { CommentsLogSkeleton } from "@/components/skeletons";
import { CommentsProvider, useComments } from "@/contexts";
import { t, useSettings, usePageLoader } from "@/hooks";
import type { CommentInterface, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn, formatDate, formatDateTime, getStorageItem, storageKeys } from "@/utils";

export const CommentsLogView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <CommentsProvider sprintId={activeSprintId}>
            <CommentsLogViewInner />
        </CommentsProvider>
    );
};

const CommentsLogViewInner = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { comments, analytics, isLoading: isFetching } = useComments();
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    const getMember = (id?: string) => members.find((m) => m.id === id);

    // Filters
    const [mentionFilter, setMentionFilter] = useState<string>("all");
    const [responseFilter, setResponseFilter] = useState<string>("all");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [viewTarget, setViewTarget] = useState<CommentInterface | null>(null);

    const stats = useMemo(() => {
        if (analytics) {
            return {
                total: analytics.total_comments,
                withMention: analytics.with_mention,
                withResponse: analytics.responded,
                noResponse: analytics.no_response,
            };
        }
        return {
            total: comments.length,
            withMention: comments.filter((c) => !!c.mentionedId).length,
            withResponse: comments.filter((c) => c.hasResponse).length,
            noResponse: comments.filter((c) => !c.hasResponse).length,
        };
    }, [analytics, comments]);

    const filtered = useMemo(() => {
        return comments.filter((c) => {
            if (mentionFilter !== "all" && c.mentionedId !== mentionFilter) return false;
            if (responseFilter === "responded" && !c.hasResponse) return false;
            if (responseFilter === "pending" && c.hasResponse) return false;
            if (fromDate && new Date(c.createdAt) < new Date(fromDate)) return false;
            if (toDate && new Date(c.createdAt) > new Date(`${toDate}T23:59:59Z`)) return false;
            return true;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [comments, mentionFilter, responseFilter, fromDate, toDate]);

    if (pageLoading || isFetching) return <CommentsLogSkeleton />;

    if (comments.length === 0) {
        return (
            <div>
                <Header title={t("Comments Log")} description={t("Track all task comments, mentions, and responses")} />
                <EmptyState icon={MessageCircle} title={t("No Comments")} description={t("No comments found for the current sprint")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Comments Log")} description={t("Track all task comments, mentions, and responses")} />

            {/* Stats */}
            <div className={cn("grid grid-cols-2 lg:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                                <MessageCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p>
                                <p className="text-xs text-text-muted">{t("Total Comments")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                                <AtSign className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.withMention} /></p>
                                <p className="text-xs text-text-muted">{t("With Mention")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-success"><AnimatedNumber value={stats.withResponse} /></p>
                                <p className="text-xs text-text-muted">{t("Responded")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-light">
                                <Clock className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-warning"><AnimatedNumber value={stats.noResponse} /></p>
                                <p className="text-xs text-text-muted">{t("No Response")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className={compact ? "mb-3" : "mb-6"}>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Mention filter */}
                        <Select value={mentionFilter} onValueChange={setMentionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t("Filter by mention")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Mentions")}</SelectItem>
                                {members.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Response filter */}
                        <Select value={responseFilter} onValueChange={setResponseFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder={t("Response status")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                <SelectItem value="responded">{t("Responded")}</SelectItem>
                                <SelectItem value="pending">{t("No Response")}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date range */}
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-9 w-auto"
                            />
                            <span className="text-xs text-text-muted">{t("to")}</span>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-9 w-auto"
                            />
                        </div>

                        {(mentionFilter !== "all" || responseFilter !== "all" || fromDate || toDate) && (
                            <button
                                onClick={() => { setMentionFilter("all"); setResponseFilter("all"); setFromDate(""); setToDate(""); }}
                                className="text-xs text-text-muted hover:text-text-dark underline"
                            >
                                {t("Clear filters")}
                            </button>
                        )}

                        <span className="ms-auto text-xs text-text-muted">
                            {filtered.length} {t("of")} {comments.length} {t("comments")}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Comments list */}
            {filtered.length === 0 ? (
                <EmptyState icon={MessageCircle} title={t("No Results")} description={t("No comments match the selected filters")} />
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((comment) => {
                        const author = getMember(comment.authorId);
                        const mentioned = getMember(comment.mentionedId);
                        const responder = getMember(comment.responderId);

                        return (
                            <Card key={comment.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewTarget(comment)}>
                                <CardContent className="p-4">
                                    {/* Task label */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {comment.taskTitle}
                                        </Badge>
                                    </div>

                                    {/* Comment content */}
                                    <p className="text-sm text-text-dark mb-3">{comment.content}</p>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Author */}
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-text-muted" />
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[8px]">{author?.avatar}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-text-secondary">{author?.name ?? "Unknown"}</span>
                                        </div>

                                        {/* Mention */}
                                        {mentioned && (
                                            <>
                                                <span className="text-xs text-text-muted">→</span>
                                                <div className="flex items-center gap-1.5">
                                                    <AtSign className="h-3.5 w-3.5 text-primary" />
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[8px]">{mentioned.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-primary font-medium">{mentioned.name}</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Time */}
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-text-muted" />
                                            <span className="text-xs text-text-muted">{formatDateTime(comment.createdAt)}</span>
                                        </div>

                                        {/* Response status */}
                                        {comment.hasResponse ? (
                                            <div className="flex items-center gap-1.5 ms-auto">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                                <span className="text-xs text-success font-medium">{t("Responded")}</span>
                                                {responder && (
                                                    <span className="text-xs text-text-muted">
                                                        {t("by")} {responder.name} · {formatDate(comment.responseAt!)}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge variant="warning" className="ms-auto text-xs">
                                                {t("No Response")}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Details Dialog */}
            <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            {t("Comment Details")}
                        </DialogTitle>
                    </DialogHeader>
                    {viewTarget && (() => {
                        const author = getMember(viewTarget.authorId);
                        const mentioned = getMember(viewTarget.mentionedId);
                        const responder = getMember(viewTarget.responderId);
                        return (
                            <div className="flex flex-col gap-4 py-2">
                                {/* Task */}
                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Task")}</p>
                                    <Badge variant="outline" className="text-xs font-normal">{viewTarget.taskTitle}</Badge>
                                </div>

                                {/* Content */}
                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Comment")}</p>
                                    <p className="text-sm text-text-dark">{viewTarget.content}</p>
                                </div>

                                {/* Author + mention */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1.5">{t("Written by")}</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{author?.avatar}</AvatarFallback></Avatar>
                                            <span className="text-sm text-text-secondary">{author?.name ?? t("Unknown")}</span>
                                        </div>
                                    </div>
                                    {mentioned && (
                                        <div>
                                            <p className="text-xs font-medium text-text-muted mb-1.5">{t("Mentioned")}</p>
                                            <div className="flex items-center gap-2">
                                                <AtSign className="h-4 w-4 text-primary" />
                                                <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{mentioned.avatar}</AvatarFallback></Avatar>
                                                <span className="text-sm text-primary font-medium">{mentioned.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Time + response */}
                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Posted")}</p>
                                        <p className="text-sm text-text-secondary">{formatDateTime(viewTarget.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Response")}</p>
                                        {viewTarget.hasResponse ? (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1 text-success">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium">{t("Responded")}</span>
                                                </div>
                                                {responder && <span className="text-xs text-text-muted">{t("by")} {responder.name}</span>}
                                                {viewTarget.responseAt && <span className="text-xs text-text-muted">{formatDate(viewTarget.responseAt)}</span>}
                                            </div>
                                        ) : (
                                            <Badge variant="warning" className="text-xs">{t("No Response")}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
};
