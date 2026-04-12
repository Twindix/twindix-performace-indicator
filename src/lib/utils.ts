export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const getEnvVariable = (key: string, defaultValue?: string): string => {
    const value = import.meta.env[`VITE_${key}`];
    if (!value && !defaultValue) {
        console.warn(`Environment variable VITE_${key} is not defined`);
    }
    return value || defaultValue || "";
};
