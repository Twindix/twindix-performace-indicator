import { Minimize2, Moon, Sun } from "lucide-react";

import { Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { AppearanceCardPropsInterface } from "@/interfaces/settings";

import { SettingToggle } from "./SettingToggle";

export const AppearanceCard = ({
    isDarkMode,
    compactView,
    onToggleDarkMode,
    onToggleCompactView,
}: AppearanceCardPropsInterface) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Sun className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-text-dark">{t("Appearance")}</h3>
            </div>
            <div className="space-y-4">
                <SettingToggle
                    label={t("Dark Mode")}
                    description={t("Switch between light and dark theme")}
                    checked={isDarkMode}
                    icon={isDarkMode ? Moon : Sun}
                    onToggle={onToggleDarkMode}
                />
                <SettingToggle
                    label={t("Compact View")}
                    description={t("Reduce spacing in lists and tables")}
                    checked={compactView}
                    icon={Minimize2}
                    onToggle={onToggleCompactView}
                />
            </div>
        </CardContent>
    </Card>
);
