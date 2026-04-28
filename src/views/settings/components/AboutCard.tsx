import { Info } from "lucide-react";

import { Card, CardContent } from "@/atoms";
import { settingsConstants } from "@/constants";
import { t } from "@/utils";

export const AboutCard = () => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-text-dark">{t("About the App")}</h3>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-dark">{t("Application")}</p>
                    <p className="text-sm text-text-secondary">{t(settingsConstants.appInfo.name)}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-dark">{t("Version")}</p>
                    <p className="text-sm text-text-secondary font-mono">{settingsConstants.appInfo.version}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);
