import { useMemo } from "react";

import { t } from "@/hooks";
import type { GanttTaskInterface } from "@/interfaces/gantt";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_W = 44; // px per day column
const ROW_H = 40; // px per task row
const ROW_GAP = 8;

const parseDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
};

const COLORS = [
    { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
    { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
    { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
];

interface GanttChartProps {
    tasks: GanttTaskInterface[];
    windowStart: string;
    windowEnd: string;
}

export const GanttChart = ({ tasks, windowStart, windowEnd }: GanttChartProps) => {
    const startTs = parseDate(windowStart);
    const endTs = parseDate(windowEnd);
    const totalDays = Math.max(1, Math.round((endTs - startTs) / DAY_MS) + 1);

    const days = useMemo(() =>
        Array.from({ length: totalDays }, (_, i) => {
            const ts = startTs + i * DAY_MS;
            const d = new Date(ts);
            return { ts, day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), weekday: d.getDay() };
        }), [startTs, totalDays]);

    const todayTs = useMemo(() => {
        const n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
    }, []);

    // Month groups for header
    const monthGroups = useMemo(() => {
        const groups: { label: string; startIdx: number; span: number }[] = [];
        days.forEach((d, i) => {
            const label = new Date(d.ts).toLocaleDateString(undefined, { month: "short", year: "numeric" });
            const last = groups[groups.length - 1];
            if (last && last.label === label) { last.span++; }
            else groups.push({ label, startIdx: i, span: 1 });
        });
        return groups;
    }, [days]);

    // Pack tasks into rows (bin-packing by date)
    const { rows, taskColorIdx } = useMemo(() => {
        const datedTasks = tasks.filter((t) => t.start_date && t.due_date);
        const undatedTasks = tasks.filter((t) => !t.start_date || !t.due_date);
        const colorMap: Record<string, number> = {};
        tasks.forEach((t, i) => { colorMap[t.id] = i % COLORS.length; });

        // row = array of tasks; find first row where task doesn't overlap any existing
        const packed: GanttTaskInterface[][] = [];
        for (const task of datedTasks) {
            const s = parseDate(task.start_date!);
            const e = parseDate(task.due_date!);
            let placed = false;
            for (const row of packed) {
                const overlaps = row.some((r) => {
                    const rs = parseDate(r.start_date!);
                    const re = parseDate(r.due_date!);
                    return s <= re && e >= rs;
                });
                if (!overlaps) { row.push(task); placed = true; break; }
            }
            if (!placed) packed.push([task]);
        }
        // undated tasks go in their own rows at the bottom
        for (const task of undatedTasks) packed.push([task]);

        return { rows: packed, taskColorIdx: colorMap };
    }, [tasks]);

    const totalW = totalDays * DAY_W;
    const totalH = rows.length * (ROW_H + ROW_GAP) + ROW_GAP;

    const colFor = (ts: number) => Math.max(0, Math.round((ts - startTs) / DAY_MS));
    const widthFor = (s: string, e: string) => {
        const cols = Math.max(1, Math.round((parseDate(e) - parseDate(s)) / DAY_MS) + 1);
        return cols * DAY_W - 4;
    };

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden select-none">
            {/* Sticky header */}
            <div className="overflow-x-auto">
                <div style={{ minWidth: totalW }}>
                    {/* Month row */}
                    <div className="flex border-b border-border bg-muted/40">
                        {monthGroups.map((g) => (
                            <div
                                key={g.label + g.startIdx}
                                className="border-r border-border px-2 py-1 text-[11px] font-bold text-text-secondary uppercase tracking-wide shrink-0"
                                style={{ width: g.span * DAY_W }}
                            >
                                {g.label}
                            </div>
                        ))}
                    </div>

                    {/* Day numbers row */}
                    <div className="flex border-b border-border bg-muted/20">
                        {days.map((d) => {
                            const isToday = d.ts === todayTs;
                            const isWeekend = d.weekday === 0 || d.weekday === 6;
                            return (
                                <div
                                    key={d.ts}
                                    className={`shrink-0 flex flex-col items-center justify-center border-r border-border/60 py-1 ${isToday ? "bg-primary/10" : isWeekend ? "bg-muted/30" : ""}`}
                                    style={{ width: DAY_W }}
                                >
                                    <span className={`text-[11px] font-semibold ${isToday ? "text-primary-medium" : "text-text-muted"}`}>
                                        {d.day}
                                    </span>
                                    <span className="text-[9px] text-text-muted/70 uppercase">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.weekday]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Task rows */}
                    <div className="relative" style={{ height: totalH }}>
                        {/* Day column backgrounds */}
                        {days.map((d, i) => {
                            const isToday = d.ts === todayTs;
                            const isWeekend = d.weekday === 0 || d.weekday === 6;
                            return (
                                <div
                                    key={d.ts}
                                    className={`absolute top-0 bottom-0 border-r border-border/40 ${isToday ? "bg-primary/5" : isWeekend ? "bg-muted/20" : ""}`}
                                    style={{ left: i * DAY_W, width: DAY_W }}
                                    aria-hidden
                                />
                            );
                        })}

                        {/* Today line */}
                        {todayTs >= startTs && todayTs <= endTs && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-primary-medium z-10"
                                style={{ left: colFor(todayTs) * DAY_W + DAY_W / 2 }}
                                aria-hidden
                            />
                        )}

                        {/* Task bars */}
                        {rows.map((row, rowIdx) =>
                            row.map((task) => {
                                const color = COLORS[taskColorIdx[task.id] ?? 0];
                                const top = rowIdx * (ROW_H + ROW_GAP) + ROW_GAP / 2;
                                if (!task.start_date || !task.due_date) {
                                    return (
                                        <div
                                            key={task.id}
                                            className={`absolute flex items-center px-2 rounded-md border text-[11px] font-semibold truncate ${color.bg} ${color.text} ${color.border}`}
                                            style={{ top, left: 4, width: totalW - 8, height: ROW_H }}
                                            title={`${task.title} · ${t("No dates set")}`}
                                        >
                                            {task.title}
                                            <span className="ms-1 opacity-60 font-normal">({t("no dates")})</span>
                                        </div>
                                    );
                                }
                                const col = colFor(parseDate(task.start_date));
                                const barW = widthFor(task.start_date, task.due_date);
                                return (
                                    <div
                                        key={task.id}
                                        className={`absolute flex items-center px-2 rounded-md border text-[11px] font-semibold truncate cursor-default shadow-sm ${color.bg} ${color.text} ${color.border}`}
                                        style={{ top, left: col * DAY_W + 2, width: barW, height: ROW_H }}
                                        title={`${task.title} · ${task.start_date} → ${task.due_date}${task.assignee ? ` · ${task.assignee}` : ""}`}
                                    >
                                        <span className="truncate">{task.title}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {tasks.length === 0 && (
                <div className="p-8 text-center text-sm text-text-muted">{t("No tasks to display.")}</div>
            )}
        </div>
    );
};
