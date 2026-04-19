import { Activity, Eye, EyeOff, Globe, Moon, Sun } from "lucide-react";
import { getErrorMessage } from "@/lib/error";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input, Label } from "@/atoms";
import { DEMO_EMAIL, DEMO_PASSWORD, routesData } from "@/data";
import { useAuth, useSettings, useTheme, t } from "@/hooks";

export const LoginView = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { onLogin } = useAuth();
    const [settings, updateSettings] = useSettings();
    const { isDarkMode, onToggleTheme } = useTheme();
    const navigate = useNavigate();
    const isArabic = settings.language === "ar";

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await onLogin(email, password);
            navigate(routesData.dashboard);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleLanguage = () => updateSettings({ language: isArabic ? "en" : "ar" });

    return (
        <div className="w-full max-w-md">
            {/* Top controls */}
            <div className="flex items-center justify-center gap-1 mb-4">
                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="h-9 gap-1.5 text-xs font-semibold px-3">
                    <Globe className="h-4 w-4" />
                    {isArabic ? "EN" : "عربي"}
                </Button>
                <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9">
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4 shadow-md">
                        <Activity className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-dark">{t("Twindix Performance Indicator")}</h1>
                    <p className="text-sm text-text-secondary mt-1">{t("Sign in to your account")}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">{t("Email")}</Label>
                        <Input id="email" type="email" placeholder={t("Enter your email")} value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">{t("Password")}</Label>
                        <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("Enter your password")} value={password} onChange={(e) => setPassword(e.target.value)} className={isArabic ? "pl-10" : "pr-10"} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors ${isArabic ? "left-3" : "right-3"}`} tabIndex={-1}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-error font-medium">{error}</p>}

                    <Button type="submit" disabled={isSubmitting} className="w-full mt-2 h-11 text-base font-semibold">
                        {isSubmitting ? t("Signing in...") : t("Sign In")}
                    </Button>
                </form>

                <div className="mt-6 rounded-xl bg-muted p-4">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 text-center">{t("Demo Credentials")}</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-muted w-20">{t("Email")}:</span>
                            <code className="text-xs font-semibold text-primary bg-primary-lighter/50 px-2 py-1 rounded-md flex-1">{DEMO_EMAIL}</code>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-muted w-20">{t("Password")}:</span>
                            <code className="text-xs font-semibold text-primary bg-primary-lighter/50 px-2 py-1 rounded-md flex-1">{DEMO_PASSWORD}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
