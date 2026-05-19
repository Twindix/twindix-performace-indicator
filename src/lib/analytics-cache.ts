const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const analyticsCache = {
    get<T>(key: string): T | null {
        const entry = store.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
        return entry.data;
    },
    set<T>(key: string, data: T): void {
        store.set(key, { data, expiresAt: Date.now() + TTL_MS });
    },
    invalidate(key: string): void {
        store.delete(key);
    },
};
