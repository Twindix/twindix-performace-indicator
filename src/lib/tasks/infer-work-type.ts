import type { TaskInterface } from "@/interfaces";

/** Infer the best-guess workType from a task's tags (for legacy data migration). */
export const inferWorkType = (tags: string[]): TaskInterface["workType"] => {
    const lower = tags.map((t) => t.toLowerCase());
    if (lower.some((t) => ["design", "ux", "ui", "figma"].includes(t))) return "Design";
    if (lower.some((t) => ["backend", "api", "db", "sql", "auth"].includes(t))) return "Backend";
    if (lower.some((t) => ["qa", "testing", "bug"].includes(t))) return "QA";
    return "Frontend";
};
