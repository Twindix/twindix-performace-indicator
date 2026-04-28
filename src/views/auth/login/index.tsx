import { useLoginForm, useSettings, useTheme } from "@/hooks";

import {
    DemoCredentials,
    LoginBrand,
    LoginForm,
    LoginTopControls,
} from "./components";

export const LoginView = () => {
    const form = useLoginForm();
    const [settings, updateSettings] = useSettings();
    const { isDarkMode, onToggleTheme } = useTheme();
    const isArabic = settings.language === "ar";
    const onToggleLanguage = () => updateSettings({ language: isArabic ? "en" : "ar" });

    return (
        <div className="w-full max-w-md">
            <LoginTopControls
                isArabic={isArabic}
                isDarkMode={isDarkMode}
                onToggleLanguage={onToggleLanguage}
                onToggleTheme={onToggleTheme}
            />

            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <LoginBrand />
                <LoginForm form={form} isArabic={isArabic} />
                <DemoCredentials />
            </div>
        </div>
    );
};
