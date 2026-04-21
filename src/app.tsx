import { RouterProvider } from "react-router-dom";

import { BoundaryErrorClass, IndicatorNetworkError } from "@/components/shared";
import { ThemeProvider } from "@/providers";
import { router } from "@/routes";
import { Toaster } from "@/ui";

export const App = () => (
    <BoundaryErrorClass>
        <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster />
            <IndicatorNetworkError />
        </ThemeProvider>
    </BoundaryErrorClass>
);
