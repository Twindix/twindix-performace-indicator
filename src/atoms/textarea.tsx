import { cn } from "@/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({ className, ...props }: TextareaProps) => (
    <textarea
        className={cn(
            "flex min-h-[80px] w-full rounded-[var(--radius-default)] border border-input bg-surface px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
            className,
        )}
        {...props}
    />
);
