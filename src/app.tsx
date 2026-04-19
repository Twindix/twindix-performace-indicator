import { RouterProvider } from "react-router-dom";

import { BoundaryErrorClass, IndicatorNetworkError } from "@/components/shared";
import { SprintsProvider } from "@/contexts";
import { AuthProvider, ThemeProvider } from "@/providers";
import { router } from "@/routes";
import { Toaster } from "@/ui";

export const App = () => (
    <BoundaryErrorClass>
        <ThemeProvider>
            <AuthProvider>
                <SprintsProvider>
                    <RouterProvider router={router} />
                    <Toaster />
                    <IndicatorNetworkError />
                </SprintsProvider>
            </AuthProvider>
        </ThemeProvider>
    </BoundaryErrorClass>
);
