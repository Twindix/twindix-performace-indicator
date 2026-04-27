import { Eye, EyeOff } from "lucide-react";

import { Button, Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { LoginFormPropsInterface } from "@/interfaces";

export const LoginForm = ({ form, isArabic }: LoginFormPropsInterface) => (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <Input
                id="email"
                type="email"
                placeholder={t("Enter your email")}
                value={form.email}
                onChange={(e) => { form.setEmail(e.target.value); form.clearError("email"); }}
                required
                autoFocus
            />
            {form.getError("email") && <p className="text-xs text-error">{form.getError("email")}</p>}
        </div>

        <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("Password")}</Label>
            <div className="relative">
                <Input
                    id="password"
                    type={form.showPassword ? "text" : "password"}
                    placeholder={t("Enter your password")}
                    value={form.password}
                    onChange={(e) => { form.setPassword(e.target.value); form.clearError("password"); }}
                    className={isArabic ? "pl-10" : "pr-10"}
                    required
                />
                <button
                    type="button"
                    onClick={form.toggleShowPassword}
                    className={`absolute top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors ${isArabic ? "left-3" : "right-3"}`}
                    tabIndex={-1}
                >
                    {form.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {form.getError("password") && <p className="text-xs text-error">{form.getError("password")}</p>}
        </div>

        {form.error && <p className="text-sm text-error font-medium">{form.error}</p>}

        <Button type="submit" loading={form.isSubmitting} className="w-full mt-2 h-11 text-base font-semibold">
            {t("Sign In")}
        </Button>
    </form>
);
