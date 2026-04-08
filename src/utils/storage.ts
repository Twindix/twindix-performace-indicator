const PREFIX = "twindix_perf_";

export const storageKeys = {
    authUser: `${PREFIX}auth_user`,
    theme: `${PREFIX}theme`,
    teamMembers: `${PREFIX}team_members`,
    sprints: `${PREFIX}sprints`,
    tasks: `${PREFIX}tasks`,
    blockers: `${PREFIX}blockers`,
    decisions: `${PREFIX}decisions`,
    communications: `${PREFIX}communications`,
    workload: `${PREFIX}workload`,
    metrics: `${PREFIX}metrics`,
    ownership: `${PREFIX}ownership`,
    handoffs: `${PREFIX}handoffs`,
    alerts: `${PREFIX}alerts`,
    redFlags: `${PREFIX}red_flags`,
    comments: `${PREFIX}comments`,
    seeded: `${PREFIX}seeded`,
} as const;

export const getStorageItem = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
        return JSON.parse(item) as T;
    } catch {
        return null;
    }
};

export const setStorageItem = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const removeStorageItem = (key: string): void => {
    localStorage.removeItem(key);
};
