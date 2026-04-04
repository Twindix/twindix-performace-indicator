import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { ThemeContext } from "@/contexts";
import { Theme } from "@/enums";
import { getStorageItem, setStorageItem, storageKeys } from "@/utils";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const stored = getStorageItem<string>(storageKeys.theme);
        if (stored) return stored === Theme.Dark;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        setStorageItem(storageKeys.theme, isDarkMode ? Theme.Dark : Theme.Light);
    }, [isDarkMode]);

    const onToggleTheme = useCallback(() => setIsDarkMode((prev) => !prev), []);

    const value = useMemo(() => ({ isDarkMode, onToggleTheme }), [isDarkMode, onToggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
