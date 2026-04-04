import { RouterProvider } from "react-router-dom";

import { AuthProvider, ThemeProvider } from "@/providers";
import { router } from "@/routes";
import { Toaster } from "@/ui";

export const App = () => (
    <ThemeProvider>
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
        </AuthProvider>
    </ThemeProvider>
);
