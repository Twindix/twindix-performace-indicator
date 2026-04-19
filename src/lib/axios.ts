import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { apisData, commonData } from "@/data";

import { deleteCookieHandler, getCookieHandler, setCookieHandler } from "./cookies";
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

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

const refreshToken = async (): Promise<string | null> => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = axios
        .post<{ data: { token: string } }>(`${apisData.baseUrl}${apisData.auth.refresh}`, {}, {
            headers: { "Accept": "application/json" },
            withCredentials: true,
        })
        .then((res) => {
            const token = res.data?.data?.token ?? null;
            if (token) setCookieHandler(commonData.token.tokenKey, token);
            return token;
        })
        .catch(() => null)
        .finally(() => { refreshPromise = null; });
    return refreshPromise;
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { message, response: { data, status } = {}, config } = error;
        const original = config as RetryableConfig | undefined;

        if (status === 401 && original && !original._retry && !original.url?.includes(apisData.auth.refresh)) {
            original._retry = true;
            const newToken = await refreshToken();
            if (newToken) {
                original.headers = {
                    ...original.headers,
                    [commonData.token.authorizationHeader]: `${commonData.token.bearerPrefix}${newToken}`,
                };
                return apiClient(original);
            }
            deleteCookieHandler(commonData.token.tokenKey);
        }

        const errorMessage =
            (data as { message?: string })?.message ||
            message ||
            "Something went wrong. Please try again.";

        return Promise.reject(new ApiError(status ?? 500, errorMessage, data));
    },
);
