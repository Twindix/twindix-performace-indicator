import { RouterProvider } from "react-router-dom";

import { ErrorBoundary, OfflineBanner } from "@/components/shared";
import { AuthProvider, ThemeProvider } from "@/providers";
import { router } from "@/routes";
import { Toaster } from "@/ui";

export const App = () => (
    <ErrorBoundary>
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
                <Toaster />
                <OfflineBanner />
            </AuthProvider>
        </ThemeProvider>
    </ErrorBoundary>
);
