import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { useGetTimeLog } from "@/hooks";
import { t } from "@/hooks";
import type { TimeLogInterface, TimeLogsSummaryInterface } from "@/interfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";

interface Props {
    sprintId: string | null | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SprintTimeLogsDialog = ({ sprintId, open, onOpenChange }: Props) => {
    const { getBySprintHandler, getSummaryHandler, isLoading } = useGetTimeLog();
    const [logs, setLogs] = useState<TimeLogInterface[]>([]);
    const [summary, setSummary] = useState<TimeLogsSummaryInterface | null>(null);

    useEffect(() => {
        if (!open || !sprintId) return;
        getBySprintHandler(sprintId).then((res) => { if (res) setLogs(res); });
        getSummaryHandler(sprintId).then((res) => { if (res) setSummary(res); });
    }, [open, sprintId, getBySprintHandler, getSummaryHandler]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <DialogTitle>{t("Sprint Time Logs")}</DialogTitle>
                    </div>
                </DialogHeader>

                {summary && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="rounded-lg bg-muted p-3 text-center">
                            <p className="text-2xl font-bold text-text-dark">{summary.total_hours}</p>
                            <p className="text-xs text-text-muted">{t("Total Hours")}</p>
                        </div>
                        <div className="rounded-lg bg-muted p-3 text-center">
                            <p className="text-2xl font-bold text-text-dark">{summary.total_entries}</p>
                            <p className="text-xs text-text-muted">{t("Entries")}</p>
                        </div>
                    </div>
                )}

                <div className="mt-4 space-y-2">
                    {isLoading && logs.length === 0 && (
                        <p className="text-sm text-text-muted text-center py-4">{t("Loading...")}</p>
                    )}
                    {!isLoading && logs.length === 0 && (
                        <p className="text-sm text-text-muted text-center py-4">{t("No time logs for this sprint.")}</p>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-dark truncate">{log.description || <span className="italic opacity-50">{t("No note")}</span>}</p>
                                <p className="text-[10px] text-text-muted">{log.date}</p>
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary-lighter/30 px-1.5 py-0.5 rounded shrink-0">{log.hours} {t("h")}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
