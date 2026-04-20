import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { apisData, commonData } from "@/data";

import { deleteCookieHandler, getCookieHandler } from "./cookies";
import { ApiError } from "./error";

export const apiClient = axios.create({
    baseURL: apisData.baseUrl,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
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
    (response) => response,
    (error: AxiosError) => {
        const { message, response: { data, status } = {} } = error;

        if (status === 401) {
            dispatchUnauthorized();
            return Promise.reject(new ApiError(401, "Unauthorized", data));
        }

        const errorMessage =
            (data as { message?: string })?.message ||
            message ||
            "Something went wrong. Please try again.";

        return Promise.reject(new ApiError(status ?? 500, errorMessage, data));
    },
);
