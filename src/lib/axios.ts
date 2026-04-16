import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { apisData, commonData, routesData } from "@/data";

import { deleteCookieHandler, getCookieHandler, setCookieHandler } from "./cookies";
import { ApiError } from "./error";

const getLoginUrlWithReturnPath = (): string => {
    const currentPath = window.location.pathname + window.location.search;
    const loginPath = routesData.login;
    if (currentPath && currentPath !== loginPath && currentPath !== "/") {
        return `${loginPath}?returnUrl=${encodeURIComponent(currentPath)}`;
    }
    return loginPath;
};

export const apiClient = axios.create({
    baseURL: apisData.baseUrl,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

let isRefreshing = false;

let failedQueue: {
    reject: (reason?: unknown) => void;
    resolve: (value?: unknown) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getCookieHandler(commonData.token.tokenKey);
        if (token && config.headers) {
            config.headers[commonData.token.authorizationHeader] =
                `${commonData.token.bearerPrefix}${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { config, message, response: { data, status } = {} } = error;

        const originalRequest = config as InternalAxiosRequestConfig & { isRetry?: boolean };

        if (status === 401 && originalRequest && !originalRequest.isRetry) {
            if (originalRequest.url === apisData.auth.refresh) {
                deleteCookieHandler(commonData.token.tokenKey);
                window.location.href = getLoginUrlWithReturnPath();
                return Promise.reject(
                    new ApiError(401, "Session expired. Please sign in again.", data),
                );
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ reject, resolve });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers[commonData.token.authorizationHeader] =
                            `${commonData.token.bearerPrefix}${token}`;
                    }
                    return apiClient(originalRequest);
                });
            }

            originalRequest.isRetry = true;
            isRefreshing = true;

            try {
                const { data: tokenData } = await apiClient.post<{ token: string }>(
                    apisData.auth.refresh,
                );
                const newToken = tokenData.token;

                setCookieHandler(commonData.token.tokenKey, newToken);
                processQueue(null, newToken);

                if (originalRequest.headers) {
                    originalRequest.headers[commonData.token.authorizationHeader] =
                        `${commonData.token.bearerPrefix}${newToken}`;
                }

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                deleteCookieHandler(commonData.token.tokenKey);
                window.location.href = getLoginUrlWithReturnPath();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        const errorMessage =
            (data as { message?: string })?.message ||
            message ||
            "Something went wrong. Please try again.";

        return Promise.reject(new ApiError(status ?? 500, errorMessage, data));
    },
);
