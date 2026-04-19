import { RouterProvider } from "react-router-dom";

import { BoundaryErrorClass, IndicatorNetworkError } from "@/components/shared";
import { AuthProvider, ThemeProvider } from "@/providers";
import { router } from "@/routes";
import { Toaster } from "@/ui";

export const App = () => (
    <BoundaryErrorClass>
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
                <Toaster />
                <IndicatorNetworkError />
            </AuthProvider>
        </ThemeProvider>
    </BoundaryErrorClass>
);
