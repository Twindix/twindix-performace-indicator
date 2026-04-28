import { Header, QueryBoundary } from "@/components/shared";
import { SettingsSkeleton } from "@/components/skeletons";
import { t } from "@/utils";
import { useAuth, usePageLoader, useTheme, useUpdateSetting } from "@/hooks";

import { AboutCard, AppearanceCard, LanguageDateCard } from "./components";

export const SettingsView = () => {
    const isLoading = usePageLoader();
    const { user } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const { updateSetting } = useUpdateSetting();

    if (!user) return null;

    const { compact_view, language, date_format } = user.settings ?? {};

    return (
        <QueryBoundary isLoading={isLoading} skeleton={<SettingsSkeleton />}>
            <div>
                <Header title={t("Settings")} description={t("Manage your account preferences and platform settings")} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                    <AppearanceCard
                        isDarkMode={isDarkMode}
                        compactView={!!compact_view}
                        onToggleDarkMode={() => { onToggleTheme(); updateSetting({ dark_mode: !isDarkMode }); }}
                        onToggleCompactView={() => updateSetting({ compact_view: !compact_view })}
                    />
                    <LanguageDateCard
                        language={language ?? null}
                        dateFormat={date_format ?? null}
                        onLanguageChange={(v) => updateSetting({ language: v })}
                        onDateFormatChange={(v) => updateSetting({ date_format: v })}
                    />
                    <AboutCard />
                </div>
            </div>
        </QueryBoundary>
    );
};
