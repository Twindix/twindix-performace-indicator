import { useState, useRef } from "react";
import { AtSign, Check, Edit2, MessageCircle, Send, Smile, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/ui";
import { cn } from "@/utils";
import { t } from "@/hooks";
import type { TaskInterface, TaskCommentInterface, UserInterface } from "@/interfaces";

const EMOJIS = ["👍", "👎", "😄", "🎉", "😕", "👀", "❤️", "🚀"];

interface Props {
    task: TaskInterface;
    currentUserId: string;
    members: UserInterface[];
    onUpdateComments?: (taskId: string, comments: TaskCommentInterface[]) => void;
}

export const TaskComments = ({ task, currentUserId, members, onUpdateComments }: Props) => {
    const comments = task.comments ?? [];
    const [commentText, setCommentText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [mentionQuery, setMentionQuery] = useState("");
    const [showMentions, setShowMentions] = useState(false);
    const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getMember = (id: string) => members.find((m) => m.id === id);

    const mentionSuggestions = members.filter(
        (m) => mentionQuery.length > 0 && (m.name ?? m.full_name ?? "").toLowerCase().includes(mentionQuery.toLowerCase())
    );

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCommentText(val);
        const atIdx = val.lastIndexOf("@");
        if (atIdx !== -1 && (atIdx === val.length - 1 || /^\w+$/.test(val.slice(atIdx + 1)))) {
            setMentionQuery(val.slice(atIdx + 1));
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
    };

    const pickMention = (m: UserInterface) => {
        const atIdx = commentText.lastIndexOf("@");
        setCommentText(commentText.slice(0, atIdx) + `@${m.name} `);
        setShowMentions(false);
        textareaRef.current?.focus();
    };

    const submit = () => {
        if (!commentText.trim() || !onUpdateComments) return;
        onUpdateComments(task.id, [...comments, {
            id: `cmt-${Date.now()}`,
            authorId: currentUserId,
            content: commentText.trim(),
            createdAt: new Date().toISOString(),
        }]);
        setCommentText("");
        setShowMentions(false);
    };

    const deleteComment = (id: string) =>
        onUpdateComments?.(task.id, comments.filter((c) => c.id !== id));

    const saveEdit = () => {
        if (!editText.trim() || !editingId || !onUpdateComments) return;
        onUpdateComments(task.id, comments.map((c) =>
            c.id === editingId ? { ...c, content: editText.trim(), updatedAt: new Date().toISOString() } : c
        ));
        setEditingId(null);
    };

    const handleReact = (commentId: string, emoji: string) => {
        if (!onUpdateComments) return;
        onUpdateComments(task.id, comments.map((c) => {
            if (c.id !== commentId) return c;
            const reactions = { ...(c.reactions ?? {}) };
            const users = reactions[emoji] ?? [];
            reactions[emoji] = users.includes(currentUserId)
                ? users.filter((id) => id !== currentUserId)
                : [...users, currentUserId];
            if (reactions[emoji].length === 0) delete reactions[emoji];
            return { ...c, reactions };
        }));
        setEmojiPickerFor(null);
    };

    return (
        <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mb-3">
                <MessageCircle className="h-3.5 w-3.5" />
                {t("Comments")}
                {comments.length > 0 && (
                    <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{comments.length}</span>
                )}
            </p>

            {comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                    {comments.map((c) => {
                        const author = getMember(c.authorId);
                        const isAuthor = c.authorId === currentUserId;
                        const isEditing = editingId === c.id;

                        return (
                            <div key={c.id} className="flex gap-2.5 group">
                                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                    <AvatarFallback className="text-[9px]">{author?.avatar ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-text-dark">{author?.name ?? t("Unknown")}</span>
                                        <span className="text-[10px] text-text-muted ms-auto">
                                            {new Date(c.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            {c.updatedAt && <span className="ms-1 italic opacity-60">({t("edited")})</span>}
                                        </span>
                                    </div>

                                    {isEditing ? (
                                        <div>
                                            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-surface px-2 py-1.5 text-sm text-text-dark focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                                            <div className="flex justify-end gap-1 mt-1">
                                                <button onClick={() => setEditingId(null)} className="p-1 rounded text-text-muted hover:text-text-dark bg-muted transition-colors cursor-pointer"><X className="h-3 w-3" /></button>
                                                <button onClick={saveEdit} className="p-1 rounded text-success bg-success-light/30 hover:bg-success-light transition-colors cursor-pointer"><Check className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-secondary bg-muted rounded-lg px-3 py-2">{c.content}</p>
                                    )}

                                    {!isEditing && (
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                            {Object.entries(c.reactions ?? {}).map(([emoji, users]) => (
                                                <button key={emoji} onClick={() => handleReact(c.id, emoji)} className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors", users.includes(currentUserId) ? "bg-primary-lighter/30 text-primary border border-primary/20" : "bg-muted text-text-muted hover:bg-accent")}>
                                                    {emoji} <span className="font-medium">{users.length}</span>
                                                </button>
                                            ))}
                                            <div className="flex items-center gap-1 ms-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="relative">
                                                    <button onClick={() => setEmojiPickerFor(emojiPickerFor === c.id ? null : c.id)} className="p-1.5 rounded text-text-muted hover:text-text-dark hover:bg-muted transition-colors cursor-pointer">
                                                        <Smile className="h-3.5 w-3.5" />
                                                    </button>
                                                    {emojiPickerFor === c.id && (
                                                        <div className="absolute bottom-full end-0 pb-1 z-20 flex items-center gap-1 p-1.5 bg-surface border border-border rounded-xl shadow-lg">
                                                            {EMOJIS.map((emoji) => (
                                                                <button key={emoji} onClick={() => handleReact(c.id, emoji)} className="p-1 hover:bg-muted rounded text-sm transition-colors cursor-pointer">{emoji}</button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {isAuthor && (
                                                    <>
                                                        <button onClick={() => { setEditingId(c.id); setEditText(c.content); }} className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-lighter/20 transition-colors cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                                                        <button onClick={() => deleteComment(c.id)} className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error-light transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="relative">
                <textarea ref={textareaRef} value={commentText} onChange={handleInput} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder={t("Write a comment… type @ to mention someone")} rows={2} className="w-full rounded-xl border border-input bg-surface px-3 py-2 pe-10 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors" />
                <button onClick={submit} disabled={!commentText.trim()} className="absolute bottom-2 end-2 p-1.5 rounded-md text-primary hover:bg-primary-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <Send className="h-4 w-4" />
                </button>
                {showMentions && mentionSuggestions.length > 0 && (
                    <div className="absolute bottom-full mb-1 start-0 w-full max-h-40 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg z-50">
                        {mentionSuggestions.map((m) => (
                            <button key={m.id} onMouseDown={(e) => { e.preventDefault(); pickMention(m); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent text-left transition-colors cursor-pointer">
                                <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-[9px]">{m.avatar}</AvatarFallback></Avatar>
                                <div>
                                    <p className="text-xs font-medium text-text-dark">{m.name}</p>
                                    <p className="text-[10px] text-text-muted flex items-center gap-1"><AtSign className="h-2.5 w-2.5" />{typeof m.team === "string" ? m.team : m.team?.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
