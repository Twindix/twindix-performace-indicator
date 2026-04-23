import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { apisData, commonData } from "@/data";

import { deleteCookieHandler, getCookieHandler } from "./cookies";
import { ApiError } from "./error";

export const apiClient = axios.create({
    baseURL: apisData.baseUrl,
    headers: {
        "Accept": "application/json",
    },
    timeout: 30000,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getCookieHandler(commonData.token.tokenKey);
        if (token && config.headers) {
            config.headers[commonData.token.authorizationHeader] =
                `${commonData.token.bearerPrefix}${token}`;
        }

        const method = (config.method ?? "get").toLowerCase();
        const needsBody = method === "post" || method === "put" || method === "patch";
        if (needsBody && (config.data === undefined || config.data === null)) {
            config.data = {};
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

let unauthorized = false;

const dispatchUnauthorized = () => {
    if (unauthorized) return;
    unauthorized = true;
    deleteCookieHandler(commonData.token.tokenKey);
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};

export const resetAuthState = () => {
    unauthorized = false;
};

apiClient.interceptors.response.use(
    (response) => {
        const body = response.data as
            | { success?: boolean; message?: string; errors?: Record<string, string[]>; code?: string }
            | undefined;

        // Some backend endpoints return 200 OK with { success: false, ... } on
        // business-level failures (e.g. duplicate email). Treat those as errors
        // so the shared runAction pipeline (toast + field-error mapping) fires.
        if (body && body.success === false) {
            const fieldErrors = body.errors && Object.keys(body.errors).length > 0 ? body.errors : undefined;
            return Promise.reject(
                new ApiError(
                    fieldErrors ? 422 : 400,
                    body.message ?? "",
                    body,
                    fieldErrors,
                    body.code,
                ),
            );
        }

        return response;
    },
    (error: AxiosError) => {
        const { message, response } = error;
        const status = response?.status;
        const data = response?.data;

        if (status !== undefined && status >= 200 && status < 300) {
            return Promise.resolve(response);
        }

        if (status === 401) {
            dispatchUnauthorized();
            return Promise.reject(new ApiError(401, "Unauthorized", data));
        }

        const body = data as
            | { message?: string; errors?: Record<string, string[]>; code?: string }
            | undefined;

        const backendMessage = body?.message ?? "";
        const transportMessage = !status ? message : "";
        const fieldErrors = status === 422 ? body?.errors : undefined;

        return Promise.reject(
            new ApiError(
                status ?? 500,
                backendMessage || transportMessage,
                data,
                fieldErrors,
                body?.code,
            ),
        );
    },
);
