import { Activity } from "lucide-react";

import { t } from "@/hooks";

export const LoginBrand = () => (
    <div className="flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4 shadow-md">
            <Activity className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-text-dark">{t("Twindix Performance Indicator")}</h1>
        <p className="text-sm text-text-secondary mt-1">{t("Sign in to your account")}</p>
    </div>
);
