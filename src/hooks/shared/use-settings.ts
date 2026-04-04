import { useCallback, useSyncExternalStore } from "react";

import { getStorageItem, setStorageItem } from "@/utils";

const SETTINGS_KEY = "twindix_perf_settings";

export interface AppSettings {
    compactView: boolean;
    notifications: {
        blockerAlerts: boolean;
        slaBreaches: boolean;
        sprintSummary: boolean;
        decisionUpdates: boolean;
    };
    language: "en" | "ar";
    dateFormat: "MMM D, YYYY" | "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
}

export const defaultSettings: AppSettings = {
    compactView: false,
    notifications: { blockerAlerts: true, slaBreaches: true, sprintSummary: false, decisionUpdates: true },
    language: "en",
    dateFormat: "MMM D, YYYY",
};

let listeners: (() => void)[] = [];
let cachedSettings: AppSettings | null = null;

const getSettings = (): AppSettings => {
    if (!cachedSettings) {
        cachedSettings = getStorageItem<AppSettings>(SETTINGS_KEY) ?? defaultSettings;
    }
    return cachedSettings;
};

export const saveSettings = (next: AppSettings) => {
    cachedSettings = next;
    setStorageItem(SETTINGS_KEY, next);
    document.documentElement.dir = next.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next.language === "ar" ? "ar" : "en";
    listeners.forEach((l) => l());
};

const init = getSettings();
document.documentElement.dir = init.language === "ar" ? "rtl" : "ltr";
document.documentElement.lang = init.language === "ar" ? "ar" : "en";

export const useSettings = (): [AppSettings, (partial: Partial<AppSettings>) => void] => {
    const settings = useSyncExternalStore(
        (cb) => { listeners.push(cb); return () => { listeners = listeners.filter((l) => l !== cb); }; },
        getSettings,
    );
    const update = useCallback((partial: Partial<AppSettings>) => {
        saveSettings({ ...getSettings(), ...partial });
    }, []);
    return [settings, update];
};

/* ─── Translations ───────────────────────────────────────────── */

const translations: Record<string, Record<"en" | "ar", string>> = {
    // Sidebar
    "Dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
    "Tasks": { en: "Tasks", ar: "المهام" },
    "Blockers": { en: "Blockers", ar: "العوائق" },
    "Decisions": { en: "Decisions", ar: "القرارات" },
    "Communication": { en: "Communication", ar: "التواصل" },
    "Workload": { en: "Workload", ar: "عبء العمل" },
    "Reports": { en: "Reports", ar: "التقارير" },
    "Analytics": { en: "Analytics", ar: "التحليلات" },
    "Ownership": { en: "Ownership", ar: "الملكية" },
    "Handoffs": { en: "Handoffs", ar: "التسليمات" },

    // Page headers & descriptions
    "Sprint Dashboard": { en: "Sprint Dashboard", ar: "لوحة متابعة السبرنت" },
    "Real-time overview of sprint health, delivery friction, and team performance": { en: "Real-time overview of sprint health, delivery friction, and team performance", ar: "نظرة عامة مباشرة على صحة السبرنت واحتكاك التسليم وأداء الفريق" },
    "Task Management": { en: "Task Management", ar: "إدارة المهام" },
    "Drag tasks between columns to change their phase. Phase gates enforce readiness criteria.": { en: "Drag tasks between columns to change their phase. Phase gates enforce readiness criteria.", ar: "اسحب المهام بين الأعمدة لتغيير مرحلتها. بوابات المراحل تفرض معايير الجاهزية." },
    "Blocker Tracker": { en: "Blocker Tracker", ar: "تتبع العوائق" },
    "Track and manage blockers affecting sprint delivery": { en: "Track and manage blockers affecting sprint delivery", ar: "تتبع وإدارة العوائق المؤثرة على تسليم السبرنت" },
    "Decision Log": { en: "Decision Log", ar: "سجل القرارات" },
    "Document and track important project decisions": { en: "Document and track important project decisions", ar: "توثيق وتتبع القرارات المهمة للمشروع" },
    "Communication Tracker": { en: "Communication Tracker", ar: "تتبع التواصل" },
    "Monitor response times and pending questions across channels": { en: "Monitor response times and pending questions across channels", ar: "مراقبة أوقات الاستجابة والأسئلة المعلقة عبر القنوات" },
    "Team Workload": { en: "Team Workload", ar: "عبء عمل الفريق" },
    "Track team capacity, utilization, and context switching": { en: "Track team capacity, utilization, and context switching", ar: "تتبع سعة الفريق والاستخدام وتبديل السياق" },
    "Sprint Analytics": { en: "Sprint Analytics", ar: "تحليلات السبرنت" },
    "Compare metrics across sprints and track improvement trends": { en: "Compare metrics across sprints and track improvement trends", ar: "مقارنة المقاييس عبر السبرنتات وتتبع اتجاهات التحسن" },
    "Ownership Map": { en: "Ownership Map", ar: "خريطة الملكية" },
    "Track component ownership and detect conflicts": { en: "Track component ownership and detect conflicts", ar: "تتبع ملكية المكونات واكتشاف التعارضات" },
    "Handoff Tracker": { en: "Handoff Tracker", ar: "تتبع التسليمات" },
    "Monitor phase transition quality with entry and exit criteria": { en: "Monitor phase transition quality with entry and exit criteria", ar: "مراقبة جودة انتقال المراحل مع معايير الدخول والخروج" },
    "My Profile": { en: "My Profile", ar: "ملفي الشخصي" },
    "Your account details and current sprint performance": { en: "Your account details and current sprint performance", ar: "تفاصيل حسابك وأدائك في السبرنت الحالي" },
    "Settings": { en: "Settings", ar: "الإعدادات" },
    "Manage your account preferences and platform settings": { en: "Manage your account preferences and platform settings", ar: "إدارة تفضيلات حسابك وإعدادات المنصة" },

    // Dashboard widgets
    "Sprint Health Score": { en: "Sprint Health Score", ar: "مؤشر صحة السبرنت" },
    "Health": { en: "Health", ar: "الصحة" },
    "Total Tasks": { en: "Total Tasks", ar: "إجمالي المهام" },
    "Active Blockers": { en: "Active Blockers", ar: "العوائق النشطة" },
    "Completed": { en: "Completed", ar: "المكتملة" },
    "Key Metrics": { en: "Key Metrics", ar: "المقاييس الرئيسية" },
    "Recent Decisions": { en: "Recent Decisions", ar: "القرارات الأخيرة" },
    "Team Workload_widget": { en: "Team Workload", ar: "عبء عمل الفريق" },

    // Tasks view
    "tasks": { en: "tasks", ar: "مهام" },
    "blocked": { en: "blocked", ar: "محظورة" },
    "No tasks": { en: "No tasks", ar: "لا توجد مهام" },
    "Drop here": { en: "Drop here", ar: "أفلت هنا" },
    "Backlog": { en: "Backlog", ar: "قائمة الانتظار" },
    "Ready": { en: "Ready", ar: "جاهز" },
    "In Progress": { en: "In Progress", ar: "قيد التنفيذ" },
    "Review": { en: "Review", ar: "المراجعة" },
    "QA": { en: "QA", ar: "ضمان الجودة" },
    "Done": { en: "Done", ar: "مكتمل" },
    "Readiness Gate Checklist": { en: "Readiness Gate Checklist", ar: "قائمة فحص الجاهزية" },
    "Assignee": { en: "Assignee", ar: "المسؤول" },
    "Story Points": { en: "Story Points", ar: "نقاط القصة" },
    "Phase": { en: "Phase", ar: "المرحلة" },
    "Created": { en: "Created", ar: "تاريخ الإنشاء" },
    "Tags": { en: "Tags", ar: "الوسوم" },
    "Blocker": { en: "Blocker", ar: "عائق" },
    "Blocked": { en: "Blocked", ar: "محظور" },
    "Search tasks or tags...": { en: "Search tasks or tags...", ar: "البحث في المهام أو الوسوم..." },
    "All Priorities": { en: "All Priorities", ar: "جميع الأولويات" },
    "All Assignees": { en: "All Assignees", ar: "جميع المسؤولين" },
    "Confirm Phase Transition": { en: "Confirm Phase Transition", ar: "تأكيد انتقال المرحلة" },
    "Transition Blocked": { en: "Transition Blocked", ar: "الانتقال محظور" },
    "Move Forward": { en: "Move Forward", ar: "التقدم للأمام" },
    "Move Back": { en: "Move Back", ar: "الرجوع" },
    "Cancel": { en: "Cancel", ar: "إلغاء" },

    // Blockers
    "Total Blockers": { en: "Total Blockers", ar: "إجمالي العوائق" },
    "Active": { en: "Active", ar: "نشط" },
    "Resolved": { en: "Resolved", ar: "تم الحل" },
    "Escalated": { en: "Escalated", ar: "تم التصعيد" },
    "Avg Duration": { en: "Avg Duration", ar: "متوسط المدة" },
    "Blocker Impact by Type": { en: "Blocker Impact by Type", ar: "تأثير العوائق حسب النوع" },

    // Decisions
    "Total Decisions": { en: "Total Decisions", ar: "إجمالي القرارات" },
    "Approved": { en: "Approved", ar: "معتمد" },
    "Pending": { en: "Pending", ar: "معلق" },
    "Rejected": { en: "Rejected", ar: "مرفوض" },
    "Deferred": { en: "Deferred", ar: "مؤجل" },
    "Decision Coverage": { en: "Decision Coverage", ar: "تغطية القرارات" },

    // Communication
    "Total Questions": { en: "Total Questions", ar: "إجمالي الأسئلة" },
    "Pending Questions": { en: "Pending Questions", ar: "الأسئلة المعلقة" },
    "Avg Response Time": { en: "Avg Response Time", ar: "متوسط وقت الاستجابة" },
    "Response Time Analysis": { en: "Response Time Analysis", ar: "تحليل وقت الاستجابة" },

    // Workload
    "Team Size": { en: "Team Size", ar: "حجم الفريق" },
    "Avg Utilization": { en: "Avg Utilization", ar: "متوسط الاستخدام" },
    "Overloaded": { en: "Overloaded", ar: "محمّل زيادة" },
    "Context Switches": { en: "Context Switches", ar: "تبديل السياق" },
    "Workload Distribution": { en: "Workload Distribution", ar: "توزيع عبء العمل" },
    "Context Switching": { en: "Context Switching", ar: "تبديل السياق" },

    // Reports
    "Executive Summary": { en: "Executive Summary", ar: "الملخص التنفيذي" },
    "Friction Analysis": { en: "Friction Analysis", ar: "تحليل الاحتكاك" },
    "Key Findings": { en: "Key Findings", ar: "النتائج الرئيسية" },
    "Recommendations": { en: "Recommendations", ar: "التوصيات" },
    "Sprint Progress": { en: "Sprint Progress", ar: "تقدم السبرنت" },

    // Analytics
    "Overview": { en: "Overview", ar: "نظرة عامة" },
    "All Metrics": { en: "All Metrics", ar: "جميع المقاييس" },
    "Sprint Trends": { en: "Sprint Trends", ar: "اتجاهات السبرنت" },
    "Friction Breakdown": { en: "Friction Breakdown", ar: "تحليل الاحتكاك" },

    // Ownership
    "Total Components": { en: "Total Components", ar: "إجمالي المكونات" },
    "Conflicts": { en: "Conflicts", ar: "التعارضات" },
    "With Backup": { en: "With Backup", ar: "مع نسخة احتياطية" },
    "Component": { en: "Component", ar: "المكون" },
    "Owner": { en: "Owner", ar: "المالك" },
    "Backup": { en: "Backup", ar: "الاحتياطي" },
    "Changes": { en: "Changes", ar: "التغييرات" },
    "Last Modified": { en: "Last Modified", ar: "آخر تعديل" },
    "Status": { en: "Status", ar: "الحالة" },
    "Conflict": { en: "Conflict", ar: "تعارض" },
    "OK": { en: "OK", ar: "موافق" },
    "None": { en: "None", ar: "لا يوجد" },
    "Ownership Conflicts": { en: "Ownership Conflicts", ar: "تعارضات الملكية" },

    // Handoffs
    "Total Handoffs": { en: "Total Handoffs", ar: "إجمالي التسليمات" },
    "Avg Completion": { en: "Avg Completion", ar: "متوسط الإنجاز" },
    "Fully Completed": { en: "Fully Completed", ar: "مكتملة بالكامل" },
    "Below Threshold": { en: "Below Threshold", ar: "أقل من الحد" },
    "Entry Criteria": { en: "Entry Criteria", ar: "معايير الدخول" },
    "Exit Criteria": { en: "Exit Criteria", ar: "معايير الخروج" },
    "Pipeline": { en: "Pipeline", ar: "خط الإنتاج" },
    "Product": { en: "Product", ar: "المنتج" },
    "Design": { en: "Design", ar: "التصميم" },
    "Development": { en: "Development", ar: "التطوير" },
    "Code Review": { en: "Code Review", ar: "مراجعة الكود" },

    // Profile
    "Current Sprint Performance": { en: "Current Sprint Performance", ar: "أداء السبرنت الحالي" },
    "Assigned Tasks": { en: "Assigned Tasks", ar: "المهام المسندة" },
    "In Progress_profile": { en: "In Progress", ar: "قيد التنفيذ" },
    "Workload Overview": { en: "Workload Overview", ar: "نظرة عامة على عبء العمل" },
    "Utilization": { en: "Utilization", ar: "الاستخدام" },
    "Capacity": { en: "Capacity", ar: "السعة" },
    "Capacity Utilization": { en: "Capacity Utilization", ar: "استخدام السعة" },
    "My Tasks This Sprint": { en: "My Tasks This Sprint", ar: "مهامي في هذا السبرنت" },
    "No tasks assigned to you this sprint.": { en: "No tasks assigned to you this sprint.", ar: "لا توجد مهام مسندة إليك في هذا السبرنت." },

    // Settings
    "Appearance": { en: "Appearance", ar: "المظهر" },
    "Dark Mode": { en: "Dark Mode", ar: "الوضع الداكن" },
    "Switch between light and dark theme": { en: "Switch between light and dark theme", ar: "التبديل بين المظهر الفاتح والداكن" },
    "Compact View": { en: "Compact View", ar: "العرض المضغوط" },
    "Reduce spacing in lists and tables": { en: "Reduce spacing in lists and tables", ar: "تقليل المسافات في القوائم والجداول" },
    "Notifications": { en: "Notifications", ar: "الإشعارات" },
    "Blocker Alerts": { en: "Blocker Alerts", ar: "تنبيهات العوائق" },
    "Get notified when a task is blocked": { en: "Get notified when a task is blocked", ar: "تلقي إشعار عند حظر مهمة" },
    "SLA Breaches": { en: "SLA Breaches", ar: "انتهاكات مستوى الخدمة" },
    "Alert when response time exceeds SLA": { en: "Alert when response time exceeds SLA", ar: "تنبيه عند تجاوز وقت الاستجابة" },
    "Sprint Summary": { en: "Sprint Summary", ar: "ملخص السبرنت" },
    "Daily sprint health digest": { en: "Daily sprint health digest", ar: "ملخص صحة السبرنت اليومي" },
    "Decision Updates": { en: "Decision Updates", ar: "تحديثات القرارات" },
    "Notify when decisions are approved": { en: "Notify when decisions are approved", ar: "إشعار عند الموافقة على القرارات" },
    "Account": { en: "Account", ar: "الحساب" },
    "Display Name": { en: "Display Name", ar: "اسم العرض" },
    "Email": { en: "Email", ar: "البريد الإلكتروني" },
    "Role": { en: "Role", ar: "الدور" },
    "Language": { en: "Language", ar: "اللغة" },
    "Interface language": { en: "Interface language", ar: "لغة الواجهة" },
    "Date Format": { en: "Date Format", ar: "صيغة التاريخ" },
    "How dates are displayed": { en: "How dates are displayed", ar: "كيفية عرض التواريخ" },
    "Language & Date": { en: "Language & Date", ar: "اللغة والتاريخ" },
    "Save Changes": { en: "Save Changes", ar: "حفظ التغييرات" },

    // Common / Topbar
    "Sign In": { en: "Sign In", ar: "تسجيل الدخول" },
    "Sign Out": { en: "Sign Out", ar: "تسجيل الخروج" },
    "Help & Reports": { en: "Help & Reports", ar: "المساعدة والتقارير" },
    "Light": { en: "Light", ar: "فاتح" },
    "Dark": { en: "Dark", ar: "داكن" },
    "Developed with": { en: "Developed with", ar: "طُوّر بـ" },
    "by": { en: "by", ar: "بواسطة" },

    // Status
    "Healthy": { en: "Healthy", ar: "سليم" },
    "Needs Attention": { en: "Needs Attention", ar: "يحتاج اهتمام" },
    "Critical": { en: "Critical", ar: "حرج" },
    "No active blockers": { en: "No active blockers", ar: "لا توجد عوائق نشطة" },
};

export const t = (key: string): string => {
    const lang = getSettings().language;
    return translations[key]?.[lang] ?? key;
};
