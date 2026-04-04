import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "@/hooks";

export const Toaster = () => {
    const { isDarkMode } = useTheme();
    return <SonnerToaster theme={isDarkMode ? "dark" : "light"} position="bottom-right" richColors />;
};
