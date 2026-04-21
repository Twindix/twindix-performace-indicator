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

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const { message, response: { data, status } = {} } = error;

        if (status === 401) {
            deleteCookieHandler(commonData.token.tokenKey);
        }

        const errorMessage =
            (data as { message?: string })?.message ||
            message ||
            "Something went wrong. Please try again.";

        return Promise.reject(new ApiError(status ?? 500, errorMessage, data));
    },
);
