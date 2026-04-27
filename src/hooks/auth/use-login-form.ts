import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routesData } from "@/data";
import type { UseLoginFormReturnInterface } from "@/interfaces";
import { ApiError, getErrorMessage } from "@/lib/error";

import { useFormErrors } from "../shared";
import { useLogin } from "./use-login";

export const useLoginForm = (): UseLoginFormReturnInterface => {
    const navigate = useNavigate();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { onLogin } = useLogin({ onFieldErrors: setFieldErrors });

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleShowPassword = () => setShowPassword((v) => !v);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        clearFieldErrors();
        setIsSubmitting(true);
        try {
            await onLogin(email, password);
            navigate(routesData.dashboard);
        } catch (err) {
            if (!(err instanceof ApiError && err.statusCode === 422)) {
                setError(getErrorMessage(err));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        email,
        password,
        showPassword,
        error,
        isSubmitting,
        setEmail,
        setPassword,
        toggleShowPassword,
        getError,
        clearError,
        onSubmit,
    };
};
