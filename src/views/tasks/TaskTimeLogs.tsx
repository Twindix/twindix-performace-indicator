import { useEffect, useState } from "react";
import { Check, Clock, Pencil, Trash2, X } from "lucide-react";

import { Button, Input } from "@/atoms";
import { useTasks } from "@/contexts";
import { UserRole } from "@/enums";
import { t, useCreateTimeLog, useDeleteTimeLog, useGetTimeLog, useUpdateTimeLog } from "@/hooks";
import type { TaskInterface, TimeLogInterface, UserInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { getStorageItem, storageKeys } from "@/utils";

interface Props {
    task: TaskInterface;
    members: UserInterface[];
}

export const TaskTimeLogs = ({ task, members }: Props) => {
    const { patchTaskLocal } = useTasks();
    const { getByTaskHandler } = useGetTimeLog();
    const { createHandler: createTimeLogHandler, isLoading: isCreating } = useCreateTimeLog();
    const { updateHandler: updateTimeLogHandler } = useUpdateTimeLog();
    const { deleteHandler: deleteTimeLogHandler } = useDeleteTimeLog();

    const currentUserId = getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "";
    const authUser = members.find((m) => m.id === currentUserId);
    const isAssignee = (task.assignees ?? []).some((a) => a.id === currentUserId);
    const isManager = authUser?.role === UserRole.CEO || authUser?.role === UserRole.CTO || authUser?.role === UserRole.ProjectManager;

    const [logs, setLogs] = useState<TimeLogInterface[]>([]);
    const [logHours, setLogHours] = useState("");
    const [logNote, setLogNote] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editHours, setEditHours] = useState("");
    const [editNote, setEditNote] = useState("");

    useEffect(() => {
        if (!isAssignee && !isManager) return;
        getByTaskHandler(task.id).then((res) => { if (res) setLogs(res); });
    }, [task.id, isAssignee, isManager, getByTaskHandler]);

    if (!isAssignee && !isManager) return null;

    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);
    const getMember = (id: string) => members.find((m) => m.id === id);

    const submitLog = async () => {
        const h = parseFloat(logHours);
        if (isNaN(h) || h <= 0) return;
        const res = await createTimeLogHandler(task.id, {
            hours: h,
            date: new Date().toISOString().split("T")[0],
            description: logNote.trim() || undefined,
        });
        if (res) {
            const next = [...logs, res];
            setLogs(next);
            patchTaskLocal(task.id, { timeLogs: next as unknown as TaskInterface["timeLogs"] });
            setLogHours("");
            setLogNote("");
        }
    };

    const startEdit = (log: TimeLogInterface) => {
        setEditingId(log.id);
        setEditHours(String(log.hours));
        setEditNote(log.description ?? "");
    };

    const saveEdit = async (id: string) => {
        const h = parseFloat(editHours);
        if (isNaN(h) || h <= 0) return;
        const res = await updateTimeLogHandler(id, {
            hours: h,
            description: editNote.trim() || undefined,
        });
        if (res) {
            const next = logs.map((l) => l.id === id ? res : l);
            setLogs(next);
            patchTaskLocal(task.id, { timeLogs: next as unknown as TaskInterface["timeLogs"] });
            setEditingId(null);
        }
    };

    const deleteLog = async (id: string) => {
        const ok = await deleteTimeLogHandler(id);
        if (ok) {
            const next = logs.filter((l) => l.id !== id);
            setLogs(next);
            patchTaskLocal(task.id, { timeLogs: next as unknown as TaskInterface["timeLogs"] });
        }
    };

    return (
        <div className="mt-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t("Time Logs")}
                    {logs.length > 0 && (
                        <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{logs.length}</span>
                    )}
                </p>
                {totalHours > 0 && (
                    <span className="text-xs font-semibold text-text-dark bg-muted px-2 py-1 rounded-lg">
                        {t("Total")}: {totalHours} {t("h")}
                    </span>
                )}
            </div>

            {logs.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                    {logs.map((log) => {
                        const author = getMember(log.user_id);
                        const isOwner = log.user_id === currentUserId;
                        const isEditing = editingId === log.id;
                        return (
                            <div key={log.id} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-muted group">
                                <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                                    <AvatarFallback className="text-[8px]">{author?.avatar_initials ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-text-dark">{author?.full_name ?? t("Unknown")}</span>
                                        <span className="text-[10px] text-text-muted">{log.date}</span>
                                    </div>
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input type="number" min="0.5" step="0.5" value={editHours} onChange={(e) => setEditHours(e.target.value)} className="w-20 h-7 text-xs bg-surface" />
                                            <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} className="flex-1 h-7 text-xs bg-surface" />
                                            <button onClick={() => saveEdit(log.id)} className="p-1 rounded text-success hover:bg-success-light cursor-pointer"><Check className="h-3 w-3" /></button>
                                            <button onClick={() => setEditingId(null)} className="p-1 rounded text-text-muted hover:bg-muted cursor-pointer"><X className="h-3 w-3" /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className="text-xs text-text-secondary truncate">{log.description || <span className="italic opacity-50">{t("No note")}</span>}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs font-bold text-primary bg-primary-lighter/30 px-1.5 py-0.5 rounded">{log.hours} {t("h")}</span>
                                                {isOwner && (
                                                    <>
                                                        <button onClick={() => startEdit(log)} className="p-1 rounded text-text-muted hover:text-primary hover:bg-primary-lighter opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button onClick={() => deleteLog(log.id)} className="p-1 rounded text-text-muted hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
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

            {isAssignee && (
                <div className="flex gap-2 items-center bg-surface border border-border rounded-xl p-2">
                    <Input type="number" min="0.5" step="0.5" placeholder={t("Hrs")} value={logHours} onChange={(e) => setLogHours(e.target.value)} className="w-20 h-8 text-sm bg-muted" />
                    <Input placeholder={t("What did you work on? (optional)")} value={logNote} onChange={(e) => setLogNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitLog(); }} className="flex-1 h-8 text-sm bg-muted" />
                    <Button size="sm" onClick={submitLog} disabled={isCreating || !logHours || parseFloat(logHours) <= 0} className="h-8 shrink-0">{isCreating ? t("...") : t("Log")}</Button>
                </div>
            )}
        </div>
    );
};
