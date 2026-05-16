import { useMemo } from "react";

import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { GanttTaskInterface } from "@/interfaces/gantt";
import { cn } from "@/utils";

import {
    GANTT_STATUS_BADGE_VARIANT,
    GANTT_STATUS_BAR_CLASS,
    GANTT_STATUS_FILL_CLASS,
    GANTT_STATUS_LABEL,
} from "./constants";

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
};

const formatMonth = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: "short", year: "numeric" });

const formatShort = (iso: string) =>
    new Date(parseDate(iso)).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const monthStartsBetween = (startTs: number, endTs: number) => {
    const starts: number[] = [];
    const cur = new Date(startTs);
    cur.setDate(1);
    if (cur.getTime() < startTs) cur.setMonth(cur.getMonth() + 1);
    while (cur.getTime() <= endTs) {
        starts.push(cur.getTime());
        cur.setMonth(cur.getMonth() + 1);
    }
    return starts;
};

interface GanttChartProps {
    tasks: GanttTaskInterface[];
    windowStart: string;
    windowEnd: string;
}

export const GanttChart = ({ tasks, windowStart, windowEnd }: GanttChartProps) => {
    const startTs = parseDate(windowStart);
    const endTs = parseDate(windowEnd) + DAY_MS;
    const totalMs = Math.max(endTs - startTs, DAY_MS);

    const months = useMemo(() => monthStartsBetween(startTs, endTs), [startTs, endTs]);
    const todayTs = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }, []);
    const todayPct = todayTs >= startTs && todayTs <= endTs ? ((todayTs - startTs) / totalMs) * 100 : null;

    const pctFor = (iso: string) => {
        const ts = parseDate(iso);
        return Math.max(0, Math.min(100, ((ts - startTs) / totalMs) * 100));
    };

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[260px_1fr] min-w-[760px]">
                {/* Header */}
                <div className="px-4 py-3 border-b border-r border-border bg-muted/30">
                    <p className="text-xs font-semibold text-text-dark uppercase tracking-wide">{t("Task")}</p>
                </div>
                <div className="relative h-12 border-b border-border bg-muted/30">
                    {months.map((ts, i) => {
                        const nextTs = months[i + 1] ?? endTs;
                        const leftPct = ((ts - startTs) / totalMs) * 100;
                        const widthPct = ((nextTs - ts) / totalMs) * 100;
                        return (
                            <div
                                key={ts}
                                className="absolute top-0 bottom-0 border-l border-border flex items-center px-2"
                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            >
                                <span className="text-[11px] font-semibold text-text-secondary whitespace-nowrap">
                                    {formatMonth(ts)}
                                </span>
                            </div>
                        );
                    })}
                    {todayPct !== null && (
                        <div
                            className="absolute top-0 bottom-0 w-px bg-primary-medium"
                            style={{ left: `${todayPct}%` }}
                            aria-hidden
                        />
                    )}
                </div>

                {/* Rows */}
                {tasks.map((task) => {
                    const leftPct = pctFor(task.start_date);
                    const rightPct = pctFor(task.end_date);
                    const widthPct = Math.max(rightPct - leftPct, 1);
                    return (
                        <div key={task.id} className="contents group">
                            <div className="px-4 py-3 border-b border-r border-border">
                                <p className="text-sm font-medium text-text-dark truncate">{task.title}</p>
                                <p className="text-[11px] text-text-muted truncate">{task.project_name}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant={GANTT_STATUS_BADGE_VARIANT[task.status]} className="text-[10px]">
                                        {t(GANTT_STATUS_LABEL[task.status])}
                                    </Badge>
                                    {task.assignee_name && (
                                        <span className="text-[11px] text-text-muted truncate">
                                            {task.assignee_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="relative h-[72px] border-b border-border">
                                {months.map((ts, i) => {
                                    const nextTs = months[i + 1] ?? endTs;
                                    const l = ((ts - startTs) / totalMs) * 100;
                                    const w = ((nextTs - ts) / totalMs) * 100;
                                    return (
                                        <div
                                            key={ts}
                                            className="absolute top-0 bottom-0 border-l border-border/60"
                                            style={{ left: `${l}%`, width: `${w}%` }}
                                            aria-hidden
                                        />
                                    );
                                })}
                                {todayPct !== null && (
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-primary-medium/70"
                                        style={{ left: `${todayPct}%` }}
                                        aria-hidden
                                    />
                                )}
                                <div
                                    className={cn(
                                        "absolute top-1/2 -translate-y-1/2 h-7 rounded-md overflow-hidden border border-border shadow-sm",
                                        GANTT_STATUS_BAR_CLASS[task.status],
                                    )}
                                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: 8 }}
                                    title={`${task.title} · ${formatShort(task.start_date)} → ${formatShort(task.end_date)} · ${task.progress}%`}
                                >
                                    <div
                                        className={cn("h-full", GANTT_STATUS_FILL_CLASS[task.status])}
                                        style={{ width: `${task.progress}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-semibold text-text-dark">
                                        <span className="truncate">{formatShort(task.start_date)}</span>
                                        <span>{task.progress}%</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
