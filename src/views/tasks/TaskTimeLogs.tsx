import { useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Button, Input } from "@/atoms";
import { Avatar, AvatarFallback } from "@/ui";
import { t } from "@/hooks";
import { getStorageItem, storageKeys } from "@/utils";
import { UserRole } from "@/enums";
import type { TaskInterface, TaskTimeLogInterface, UserInterface } from "@/interfaces";

interface Props {
    task: TaskInterface;
    members: UserInterface[];
    onUpdateTimeLogs?: (taskId: string, timeLogs: TaskTimeLogInterface[]) => void;
}

export const TaskTimeLogs = ({ task, members, onUpdateTimeLogs }: Props) => {
    const currentUserId = getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "";
    const authUser = members.find((m) => m.id === currentUserId);
    const isAssignee = task.assigneeIds.includes(currentUserId);
    const isManager = authUser?.role === UserRole.CEO || authUser?.role === UserRole.CTO || authUser?.role === UserRole.ProjectManager;

    if (!isAssignee && !isManager) return null;

    const timeLogs = task.timeLogs ?? [];
    const totalHours = timeLogs.reduce((sum, l) => sum + l.hours, 0);

    const [logHours, setLogHours] = useState("");
    const [logNote, setLogNote] = useState("");

    const getMember = (id: string) => members.find((m) => m.id === id);

    const submitLog = () => {
        const h = parseFloat(logHours);
        if (isNaN(h) || h <= 0 || !onUpdateTimeLogs) return;
        const entry: TaskTimeLogInterface = {
            id: `log-${Date.now()}`,
            userId: currentUserId,
            phase: task.phase,
            hours: h,
            description: logNote.trim(),
            createdAt: new Date().toISOString(),
        };
        onUpdateTimeLogs(task.id, [...timeLogs, entry]);
        setLogHours("");
        setLogNote("");
    };

    const deleteLog = (id: string) =>
        onUpdateTimeLogs?.(task.id, timeLogs.filter((l) => l.id !== id));

    return (
        <div className="mt-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t("Time Logs")}
                    {timeLogs.length > 0 && (
                        <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{timeLogs.length}</span>
                    )}
                </p>
                {totalHours > 0 && (
                    <span className="text-xs font-semibold text-text-dark bg-muted px-2 py-1 rounded-lg">
                        {t("Total")}: {totalHours} {t("h")}
                    </span>
                )}
            </div>

            {timeLogs.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                    {timeLogs.map((log) => {
                        const author = getMember(log.userId);
                        const isOwner = log.userId === currentUserId;
                        return (
                            <div key={log.id} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-muted group">
                                <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                                    <AvatarFallback className="text-[8px]">{author?.avatar ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-text-dark">{author?.name ?? t("Unknown")}</span>
                                        <span className="text-[10px] text-text-muted">
                                            {new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-0.5">
                                        <p className="text-xs text-text-secondary truncate">{log.description || <span className="italic opacity-50">{t("No note")}</span>}</p>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-bold text-primary bg-primary-lighter/30 px-1.5 py-0.5 rounded">{log.hours} {t("h")}</span>
                                            {isOwner && (
                                                <button onClick={() => deleteLog(log.id)} className="p-1 rounded text-text-muted hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
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
                    <Button size="sm" onClick={submitLog} disabled={!logHours || parseFloat(logHours) <= 0} className="h-8 shrink-0">{t("Log")}</Button>
                </div>
            )}
        </div>
    );
};
