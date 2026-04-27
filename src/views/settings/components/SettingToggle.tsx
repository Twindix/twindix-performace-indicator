import type { SettingTogglePropsInterface } from "@/interfaces/settings";

export const SettingToggle = ({ label, description, checked, icon: Icon, onToggle }: SettingTogglePropsInterface) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-text-dark">{label}</p>
            <p className="text-xs text-text-muted">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out ${checked ? "bg-primary border-primary" : "bg-muted border-muted"}`}
        >
            <span className={`pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${checked ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-[2px] rtl:-translate-x-[2px]"}`}>
                <Icon className={`h-3.5 w-3.5 ${checked ? "text-primary" : "text-text-muted"}`} />
            </span>
        </button>
    </div>
);
