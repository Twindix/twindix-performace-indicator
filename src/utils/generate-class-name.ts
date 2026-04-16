import { cn } from "./cn";

export const generateClassNameHandler = (...args: Parameters<typeof cn>): string => cn(...args);
