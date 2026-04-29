import type { UserLiteInterface } from "@/interfaces";

/** Extract @query at end of text before cursor (e.g. "hello @bas" → "bas") */
export const getMentionQuery = (text: string, cursor: number): string | null => {
    const match = text.slice(0, cursor).match(/@(\w*)$/);
    return match ? match[1] : null;
};

/** Replace @query with @Full Name and return new text + cursor */
export const applyMention = (
    text: string,
    cursor: number,
    user: UserLiteInterface,
): { text: string; cursor: number } => {
    const match = text.slice(0, cursor).match(/@(\w*)$/);
    if (!match) return { text, cursor };
    const start = cursor - match[0].length;
    const ins = `@${user.full_name} `;
    return { text: text.slice(0, start) + ins + text.slice(cursor), cursor: start + ins.length };
};

/**
 * Render comment body splitting it into plain text and mention spans.
 * Returns an array of { text, isMention } parts ready for the caller to wrap in JSX.
 */
export const splitMentions = (
    body: string,
    mentioned: { id: string; full_name: string }[],
): { text: string; isMention: boolean }[] => {
    if (!mentioned.length) return [{ text: body, isMention: false }];
    const escaped = mentioned.map((u) => u.full_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(@(?:${escaped.join("|")}))`, "g");
    return body.split(re).map((part) => ({ text: part, isMention: part.startsWith("@") }));
};
