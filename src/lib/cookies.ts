import { commonData } from "@/data";

export const getCookieHandler = (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
};

export const setCookieHandler = (name: string, value: string, days: number = 7): void => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `${commonData.cookie.expiresPrefix}${date.toUTCString()}${commonData.cookie.pathSuffix}`;
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}`;
};

export const deleteCookieHandler = (name: string): void => {
    document.cookie = `${name}${commonData.cookie.expiredDate}`;
};
