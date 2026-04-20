import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import { App } from "./app";

registerSW({
    onNeedRefresh() {
        if (confirm("A new version is available. Reload to update?")) {
            window.location.reload();
        }
    },
    onOfflineReady() {
        console.log("[Twindix] App ready to work offline");
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
