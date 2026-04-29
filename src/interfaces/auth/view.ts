import type { FormEvent } from "react";

import type { FieldErrors } from "@/hooks/shared/use-form-errors";

// === Hook arg / return types ===

export interface UseLoginOptionsInterface {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export interface UseUpdateMeOptionsInterface {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export interface UseLoginFormReturnInterface {
    email: string;
    password: string;
    showPassword: boolean;
    error: string;
    isSubmitting: boolean;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    toggleShowPassword: () => void;
    getError: (field: string) => string | undefined;
    clearError: (field: string) => void;
    onSubmit: (e: FormEvent) => Promise<void>;
}

// === Component prop interfaces ===

export interface LoginTopControlsPropsInterface {
    isArabic: boolean;
    isDarkMode: boolean;
    onToggleLanguage: () => void;
    onToggleTheme: () => void;
}

export interface LoginFormPropsInterface {
    form: UseLoginFormReturnInterface;
    isArabic: boolean;
}
