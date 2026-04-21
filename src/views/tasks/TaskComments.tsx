import { useState, useRef, useMemo } from "react";
import { MessageCircle, Send, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/ui";
import { t } from "@/hooks";
import type { TaskInterface, TaskCommentInterface, UserInterface } from "@/interfaces";
import { commentsService } from "@/services";
import { useAuthStore } from "@/store";
import { tasksConstants } from "@/constants/tasks";

interface Props {
    task: TaskInterface;
    currentUserId: string;
    members: UserInterface[];
    onUpdateComments?: (taskId: string, comments: TaskCommentInterface[]) => void;
}

// Extract @query at end of text before cursor (e.g. "hello @bas" → "bas")
const getMentionQuery = (text: string, cursor: number): string | null => {
    const match = text.slice(0, cursor).match(/@(\w*)$/);
    return match ? match[1] : null;
};

// Replace @query with @Full Name and return new text + cursor
const applyMention = (text: string, cursor: number, user: UserInterface) => {
    const match = text.slice(0, cursor).match(/@(\w*)$/);
    if (!match) return { text, cursor };
    const start = cursor - match[0].length;
    const ins = `@${user.full_name} `;
    return { text: text.slice(0, start) + ins + text.slice(cursor), cursor: start + ins.length };
};

// Render comment body with @mentions highlighted using mentioned_users list
const renderBody = (body: string, mentioned: { id: string; full_name: string }[]) => {
    if (!mentioned.length) return <>{body}</>;
    const escaped = mentioned.map((u) => u.full_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(@(?:${escaped.join("|")}))`, "g");
    const parts = body.split(re);
    return (
        <>
            {parts.map((p, i) =>
                p.startsWith("@") ? (
                    <span key={i} className="inline-block bg-primary-lighter text-primary-medium font-medium rounded px-1">
                        {p}
                    </span>
                ) : (
                    p
                )
            )}
        </>
    );
};

export const TaskComments = ({ task, members, onUpdateComments }: Props) => {
    const { user: authUser } = useAuthStore();
    const currentUserId = authUser?.id ?? "";

    const [comments, setComments] = useState<TaskCommentInterface[]>(task.comments ?? []);

    // New comment state
    const [commentText, setCommentText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [mentionActive, setMentionActive] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionIndex, setMentionIndex] = useState(0);
    const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editMentionActive, setEditMentionActive] = useState(false);
    const [editMentionQuery, setEditMentionQuery] = useState("");
    const [editMentionIndex, setEditMentionIndex] = useState(0);
    const [editMentionedUserIds, setEditMentionedUserIds] = useState<string[]>([]);
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);

    const mentionMembers = useMemo(
        () => members.filter((m) => m.full_name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 8),
        [members, mentionQuery]
    );
    const editMentionMembers = useMemo(
        () => members.filter((m) => m.full_name.toLowerCase().includes(editMentionQuery.toLowerCase())).slice(0, 8),
        [members, editMentionQuery]
    );

    // ── New comment handlers ──────────────────────────────────────────────

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCommentText(val);
        const q = getMentionQuery(val, e.target.selectionStart ?? val.length);
        if (q !== null) { setMentionQuery(q); setMentionActive(true); setMentionIndex(0); }
        else setMentionActive(false);
    };

    const selectMention = (user: UserInterface) => {
        const cursor = textareaRef.current?.selectionStart ?? commentText.length;
        const result = applyMention(commentText, cursor, user);
        setCommentText(result.text);
        setMentionedUserIds((prev) => (prev.includes(user.id) ? prev : [...prev, user.id]));
        setMentionActive(false);
        setMentionQuery("");
        setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(result.cursor, result.cursor);
        }, 0);
    };

    const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (mentionActive && mentionMembers.length > 0) {
            if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => Math.min(i + 1, mentionMembers.length - 1)); return; }
            if (e.key === "ArrowUp")   { e.preventDefault(); setMentionIndex((i) => Math.max(i - 1, 0)); return; }
            if (e.key === "Enter")     { e.preventDefault(); selectMention(mentionMembers[mentionIndex]); return; }
            if (e.key === "Escape")    { e.preventDefault(); setMentionActive(false); return; }
        }
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    };

    const submit = async () => {
        if (!commentText.trim() || isSending) return;
        setIsSending(true);
        setMentionActive(false);
        try {
            const created = await commentsService.createHandler(task.id, {
                body: commentText.trim(),
                ...(mentionedUserIds.length > 0 && { mentioned_user_ids: mentionedUserIds }),
            }) as unknown as TaskCommentInterface;
            const next = [...comments, created];
            setComments(next);
            onUpdateComments?.(task.id, next);
            setCommentText("");
            setMentionedUserIds([]);
        } catch {
            toast.error(t(tasksConstants.errors.commentAddFailed));
        } finally {
            setIsSending(false);
        }
    };

    // ── Edit handlers ─────────────────────────────────────────────────────

    const startEdit = (comment: TaskCommentInterface) => {
        setEditingId(comment.id);
        setEditText(comment.body);
        setEditMentionedUserIds(comment.mentioned_users.map((u) => u.id));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText("");
        setEditMentionActive(false);
        setEditMentionedUserIds([]);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setEditText(val);
        const q = getMentionQuery(val, e.target.selectionStart ?? val.length);
        if (q !== null) { setEditMentionQuery(q); setEditMentionActive(true); setEditMentionIndex(0); }
        else setEditMentionActive(false);
    };

    const selectEditMention = (user: UserInterface) => {
        const cursor = editTextareaRef.current?.selectionStart ?? editText.length;
        const result = applyMention(editText, cursor, user);
        setEditText(result.text);
        setEditMentionedUserIds((prev) => (prev.includes(user.id) ? prev : [...prev, user.id]));
        setEditMentionActive(false);
        setEditMentionQuery("");
        setTimeout(() => {
            editTextareaRef.current?.focus();
            editTextareaRef.current?.setSelectionRange(result.cursor, result.cursor);
        }, 0);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
        if (editMentionActive && editMentionMembers.length > 0) {
            if (e.key === "ArrowDown") { e.preventDefault(); setEditMentionIndex((i) => Math.min(i + 1, editMentionMembers.length - 1)); return; }
            if (e.key === "ArrowUp")   { e.preventDefault(); setEditMentionIndex((i) => Math.max(i - 1, 0)); return; }
            if (e.key === "Enter")     { e.preventDefault(); selectEditMention(editMentionMembers[editMentionIndex]); return; }
            if (e.key === "Escape")    { e.preventDefault(); setEditMentionActive(false); return; }
        }
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(id); }
        if (e.key === "Escape") cancelEdit();
    };

    const saveEdit = async (id: string) => {
        if (!editText.trim() || isSavingEdit) return;
        setIsSavingEdit(true);
        setEditMentionActive(false);
        try {
            const updated = await commentsService.updateHandler(id, {
                body: editText.trim(),
                mentioned_user_ids: editMentionedUserIds,
            }) as unknown as TaskCommentInterface;
            const next = comments.map((c) => (c.id === id ? updated : c));
            setComments(next);
            onUpdateComments?.(task.id, next);
            setEditingId(null);
            setEditText("");
            setEditMentionedUserIds([]);
        } catch {
            toast.error(t(tasksConstants.errors.commentUpdateFailed));
        } finally {
            setIsSavingEdit(false);
        }
    };

    const deleteComment = async (id: string) => {
        try {
            await commentsService.deleteHandler(id);
            const next = comments.filter((c) => c.id !== id);
            setComments(next);
            onUpdateComments?.(task.id, next);
        } catch {
            toast.error(t(tasksConstants.errors.commentDeleteFailed));
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mb-3">
                <MessageCircle className="h-3.5 w-3.5" />
                {t("Comments")}
                {comments.length > 0 && (
                    <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{comments.length}</span>
                )}
            </p>

            {comments.length === 0 && (
                <p className="text-xs text-text-muted italic mb-3">{t("No comments yet")}</p>
            )}

            {comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                    {comments.map((c) => {
                        const isAuthor = c.author.id === currentUserId;
                        const isEditing = editingId === c.id;
                        return (
                            <div key={c.id} className="flex gap-2.5 group">
                                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                    <AvatarFallback className="text-[9px]">{c.author.avatar_initials ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-text-dark">{c.author.full_name}</span>
                                        <span className="text-[10px] text-text-muted ms-auto">
                                            {new Date(c.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {isAuthor && !isEditing && (
                                            <>
                                                <button onClick={() => startEdit(c)} className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-lighter opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button onClick={() => deleteComment(c.id)} className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="relative">
                                            {editMentionActive && editMentionMembers.length > 0 && (
                                                <MentionDropdown members={editMentionMembers} activeIndex={editMentionIndex} onSelect={selectEditMention} />
                                            )}
                                            <textarea
                                                ref={editTextareaRef}
                                                value={editText}
                                                onChange={handleEditChange}
                                                onKeyDown={(e) => handleEditKeyDown(e, c.id)}
                                                rows={2}
                                                className="w-full rounded-xl border border-input bg-surface px-3 py-2 pe-16 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                                                autoFocus
                                            />
                                            <div className="absolute bottom-2 end-2 flex gap-1">
                                                <button onClick={() => saveEdit(c.id)} disabled={!editText.trim() || isSavingEdit} className="p-1.5 rounded-md text-primary hover:bg-primary-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={cancelEdit} className="p-1.5 rounded-md text-text-muted hover:bg-muted transition-colors cursor-pointer">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-secondary bg-muted rounded-lg px-3 py-2">
                                            {renderBody(c.body, c.mentioned_users)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New comment input */}
            <div className="relative">
                {mentionActive && mentionMembers.length > 0 && (
                    <MentionDropdown members={mentionMembers} activeIndex={mentionIndex} onSelect={selectMention} />
                )}
                <textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={handleCommentChange}
                    onKeyDown={handleCommentKeyDown}
                    placeholder={t("Write a comment… type @ to mention")}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-surface px-3 py-2 pe-10 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                />
                <button
                    onClick={submit}
                    disabled={!commentText.trim() || isSending}
                    className="absolute bottom-2 end-2 p-1.5 rounded-md text-primary hover:bg-primary-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

interface MentionDropdownProps {
    members: UserInterface[];
    activeIndex: number;
    onSelect: (user: UserInterface) => void;
}

const MentionDropdown = ({ members, activeIndex, onSelect }: MentionDropdownProps) => (
    <div className="absolute bottom-full mb-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
        {members.map((m, i) => (
            <button
                key={m.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onSelect(m); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${i === activeIndex ? "bg-primary-lighter" : "hover:bg-muted"}`}
            >
                <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[8px]">{m.avatar_initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${i === activeIndex ? "text-primary" : "text-text-dark"}`}>{m.full_name}</p>
                    <p className="text-[10px] text-text-muted truncate">{m.role_label}</p>
                </div>
            </button>
        ))}
    </div>
);
