export const capitalize = (s: string): string =>
    s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
