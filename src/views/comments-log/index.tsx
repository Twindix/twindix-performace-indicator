import { useEffect, useMemo, useState } from "react";
import { AtSign, MessageCircle, CheckCircle2, Clock, User, Plus, Pencil, Trash2, Reply } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { CommentsLogSkeleton } from "@/components/skeletons";
import { CommentsProvider, useComments } from "@/contexts";
import { t, useAuth, useSettings, usePageLoader, useCreateComment, useUpdateComment, useDeleteComment, useRespondComment } from "@/hooks";
import type { CommentInterface, UserInterface } from "@/interfaces";
import { usersService } from "@/services";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn, formatDate, formatDateTime } from "@/utils";

export const CommentsLogView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <CommentsProvider sprintId={activeSprintId}>
            <CommentsLogViewInner />
        </CommentsProvider>
    );
};

const emptyForm = { body: "", task_title: "", mentioned_user_ids: [] as string[] };

const CommentsLogViewInner = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();
    const compact = settings.compactView;
    const { comments, analytics, isLoading: isFetching, patchCommentLocal, removeCommentLocal, refetchAnalytics } = useComments();
    const { createHandler: createCommentHandler, isLoading: isCreating } = useCreateComment();
    const { updateHandler: updateCommentHandler, isLoading: isUpdating } = useUpdateComment();
    const { deleteHandler: deleteCommentHandler } = useDeleteComment();
    const { respondHandler: respondCommentHandler } = useRespondComment();
    const [members, setMembers] = useState<UserInterface[]>([]);

    useEffect(() => {
        usersService.listHandler().then((res) => setMembers(res.data)).catch(() => {});
    }, []);

    // Filters
    const [mentionFilter, setMentionFilter] = useState<string>("all");
    const [responseFilter, setResponseFilter] = useState<string>("all");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [viewTarget, setViewTarget] = useState<CommentInterface | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CommentInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CommentInterface | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openEdit = (c: CommentInterface) => {
        setForm({
            body: c.body ?? "",
            task_title: c.task_title ?? "",
            mentioned_user_ids: c.mentions?.map((m) => m.id) ?? [],
        });
        setEditTarget(c);
    };

    const handleAdd = async () => {
        if (!form.body.trim() || !activeSprintId) return;
        const res = await createCommentHandler(activeSprintId, {
            body: form.body.trim(),
            task_title: form.task_title.trim() || undefined,
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) {
            patchCommentLocal(res);
            refetchAnalytics();
            setAddOpen(false);
            setForm(emptyForm);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateCommentHandler(editTarget.id, {
            body: form.body.trim(),
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) {
            patchCommentLocal(res);
            setEditTarget(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteCommentHandler(deleteTarget.id);
        if (ok) {
            removeCommentLocal(deleteTarget.id);
            refetchAnalytics();
            setDeleteTarget(null);
        }
    };

    const handleRespond = async (id: string) => {
        const res = await respondCommentHandler(id);
        if (res) { patchCommentLocal(res); refetchAnalytics(); }
    };

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
            withMention: comments.filter((c) => (c.mentions?.length ?? 0) > 0).length,
            withResponse: comments.filter((c) => c.response_status !== "no_response").length,
            noResponse: comments.filter((c) => c.response_status === "no_response").length,
        };
    }, [analytics, comments]);

    const filtered = useMemo(() => {
        return comments.filter((c) => {
            if (mentionFilter !== "all" && !c.mentions?.some((m) => m.id === mentionFilter)) return false;
            if (responseFilter === "responded" && c.response_status === "no_response") return false;
            if (responseFilter === "pending" && c.response_status !== "no_response") return false;
            if (fromDate && new Date(c.created_at) < new Date(fromDate)) return false;
            if (toDate && new Date(c.created_at) > new Date(`${toDate}T23:59:59Z`)) return false;
            return true;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [comments, mentionFilter, responseFilter, fromDate, toDate]);

    if (pageLoading || isFetching) return <CommentsLogSkeleton />;

    const headerActions = (
        <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="gap-2" disabled={!activeSprintId}>
            <Plus className="h-4 w-4" />
            {t("Add Comment")}
        </Button>
    );

    if (comments.length === 0) {
        return (
            <div>
                <Header title={t("Comments Log")} description={t("Track all task comments, mentions, and responses")} actions={headerActions} />
                <EmptyState icon={MessageCircle} title={t("No Comments")} description={t("No comments found for the current sprint")} />
                {renderFormDialog()}
            </div>
        );
    }

    function renderFormDialog() {
        return (
            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) { setAddOpen(false); setEditTarget(null); setForm(emptyForm); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Comment") : t("Add Comment")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-3">
                        {!editTarget && (
                            <div className="space-y-2">
                                <Label>{t("Task Title")}</Label>
                                <Input value={form.task_title} onChange={(e) => setForm({ ...form, task_title: e.target.value })} placeholder={t("Optional task title")} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>{t("Body")} <span className="text-error">*</span></Label>
                            <Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t("Write a comment...")} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Mention Users")}</Label>
                            <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                                {members.map((m) => {
                                    const checked = form.mentioned_user_ids.includes(m.id);
                                    return (
                                        <label key={m.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-muted">
                                            <input type="checkbox" checked={checked} onChange={(e) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    mentioned_user_ids: e.target.checked
                                                        ? [...prev.mentioned_user_ids, m.id]
                                                        : prev.mentioned_user_ids.filter((i) => i !== m.id),
                                                }));
                                            }} />
                                            <span className="text-xs">{m.full_name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={editTarget ? handleEdit : handleAdd} disabled={isCreating || isUpdating || !form.body.trim()}>
                            {(isCreating || isUpdating) ? t("Saving...") : editTarget ? t("Save") : t("Create")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div>
            <Header title={t("Comments Log")} description={t("Track all task comments, mentions, and responses")} actions={headerActions} />

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
                                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
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
                        const author = comment.author;
                        const mentioned = comment.mentions?.[0];

                        const isOwner = user?.id === comment.author?.id;

                        return (
                            <Card key={comment.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    {/* Task label + actions */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {comment.task_title}
                                        </Badge>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {comment.response_status === "no_response" && (
                                                <button onClick={() => handleRespond(comment.id)} className="p-1.5 rounded hover:bg-success-light text-text-muted hover:text-success cursor-pointer" title={t("Respond")}>
                                                    <Reply className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {isOwner && (
                                                <>
                                                    <button onClick={() => openEdit(comment)} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer" title={t("Edit")}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(comment)} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer" title={t("Delete")}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment content */}
                                    <p className="text-sm text-text-dark mb-3 cursor-pointer" onClick={() => setViewTarget(comment)}>{comment.body}</p>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Author */}
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-text-muted" />
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[8px]">{author?.avatar_initials}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-text-secondary">{author?.full_name ?? "Unknown"}</span>
                                        </div>

                                        {/* Mention */}
                                        {mentioned && (
                                            <>
                                                <span className="text-xs text-text-muted">→</span>
                                                <div className="flex items-center gap-1.5">
                                                    <AtSign className="h-3.5 w-3.5 text-primary" />
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[8px]">{mentioned.avatar_initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-primary font-medium">{mentioned.full_name}</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Time */}
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-text-muted" />
                                            <span className="text-xs text-text-muted">{formatDateTime(comment.created_at)}</span>
                                        </div>

                                        {/* Response status */}
                                        {comment.response_status !== "no_response" ? (
                                            <div className="flex items-center gap-1.5 ms-auto">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                                <span className="text-xs text-success font-medium">{t("Responded")}</span>
                                                {comment.responded_at && (
                                                    <span className="text-xs text-text-muted">
                                                        · {formatDate(comment.responded_at)}
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
                        const author = viewTarget.author;
                        const mentioned = viewTarget.mentions?.[0];
                        return (
                            <div className="flex flex-col gap-4 py-2">
                                {/* Task */}
                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Task")}</p>
                                    <Badge variant="outline" className="text-xs font-normal">{viewTarget.task_title}</Badge>
                                </div>

                                {/* Content */}
                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Comment")}</p>
                                    <p className="text-sm text-text-dark">{viewTarget.body}</p>
                                </div>

                                {/* Author + mention */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1.5">{t("Written by")}</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{author?.avatar_initials}</AvatarFallback></Avatar>
                                            <span className="text-sm text-text-secondary">{author?.full_name ?? t("Unknown")}</span>
                                        </div>
                                    </div>
                                    {mentioned && (
                                        <div>
                                            <p className="text-xs font-medium text-text-muted mb-1.5">{t("Mentioned")}</p>
                                            <div className="flex items-center gap-2">
                                                <AtSign className="h-4 w-4 text-primary" />
                                                <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{mentioned.avatar_initials}</AvatarFallback></Avatar>
                                                <span className="text-sm text-primary font-medium">{mentioned.full_name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Time + response */}
                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Posted")}</p>
                                        <p className="text-sm text-text-secondary">{formatDateTime(viewTarget.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Response")}</p>
                                        {viewTarget.response_status !== "no_response" ? (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1 text-success">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium">{t("Responded")}</span>
                                                </div>
                                                {viewTarget.responded_at && <span className="text-xs text-text-muted">{formatDate(viewTarget.responded_at)}</span>}
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

            {renderFormDialog()}

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{t("Delete Comment")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
