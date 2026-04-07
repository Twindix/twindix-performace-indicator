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
    // Brand
    "Twindix": { en: "Twindix", ar: "توينديكس" },
    "Performance Indicator": { en: "Performance Indicator", ar: "مؤشر الأداء" },
    "Twindix Performance Indicator v0.1": { en: "Twindix Performance Indicator v0.1", ar: "توينديكس مؤشر الأداء v0.1" },

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

    // About section
    "About the App": { en: "About the App", ar: "حول التطبيق" },
    "Application": { en: "Application", ar: "التطبيق" },
    "Twindix Performance Indicator": { en: "Twindix Performance Indicator", ar: "توينديكس مؤشر الأداء" },
    "Version": { en: "Version", ar: "الإصدار" },
    "Developer": { en: "Developer", ar: "المطور" },

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

    // Communication labels
    "Slack": { en: "Slack", ar: "سلاك" },
    "Meeting": { en: "Meeting", ar: "اجتماع" },
    "Jira": { en: "Jira", ar: "جيرا" },
    "Answered": { en: "Answered", ar: "تمت الإجابة" },

    // Decision categories
    "Architecture": { en: "Architecture", ar: "الهيكلة" },
    "Process": { en: "Process", ar: "العمليات" },
    "Tooling": { en: "Tooling", ar: "الأدوات" },
    "Requirement": { en: "Requirement", ar: "المتطلبات" },

    // Blocker type labels
    "Requirements": { en: "Requirements", ar: "المتطلبات" },
    "API Dependency": { en: "API Dependency", ar: "تبعية API" },
    "Technical": { en: "Technical", ar: "تقني" },
    "QA Handoff": { en: "QA Handoff", ar: "تسليم ضمان الجودة" },

    // Blocker view
    "All Statuses": { en: "All Statuses", ar: "جميع الحالات" },
    "All Types": { en: "All Types", ar: "جميع الأنواع" },
    "No blockers found": { en: "No blockers found", ar: "لا توجد عوائق" },
    "No blockers match the current filters": { en: "No blockers match the current filters. Try adjusting your filter criteria.", ar: "لا توجد عوائق تطابق المرشحات الحالية. حاول تعديل معايير البحث." },
    "Reported by": { en: "Reported by", ar: "أبلغ عنه" },
    "Owned by": { en: "Owned by", ar: "مملوك بواسطة" },
    "Unknown": { en: "Unknown", ar: "غير معروف" },
    "Unassigned": { en: "Unassigned", ar: "غير مُسند" },
    "days": { en: "days", ar: "أيام" },
    "tasks affected": { en: "tasks affected", ar: "مهام متأثرة" },
    "High": { en: "High", ar: "عالي" },
    "Medium": { en: "Medium", ar: "متوسط" },
    "Low": { en: "Low", ar: "منخفض" },

    // Decisions view
    "All Categories": { en: "All Categories", ar: "جميع الفئات" },
    "No decisions found": { en: "No decisions found", ar: "لا توجد قرارات" },
    "No decisions match the selected filters": { en: "No decisions match the selected filters for this sprint.", ar: "لا توجد قرارات تطابق المرشحات المحددة لهذا السبرنت." },
    "Decided": { en: "Decided", ar: "تم القرار" },
    "Outcome": { en: "Outcome", ar: "النتيجة" },
    "Description": { en: "Description", ar: "الوصف" },
    "Context": { en: "Context", ar: "السياق" },
    "Participants": { en: "Participants", ar: "المشاركون" },
    "Decision details and context": { en: "Decision details and context", ar: "تفاصيل القرار والسياق" },

    // Communication view
    "No Communications": { en: "No Communications", ar: "لا توجد اتصالات" },
    "No communication data available for the current sprint": { en: "No communication data available for the current sprint.", ar: "لا توجد بيانات تواصل متاحة للسبرنت الحالي." },
    "Avg Response": { en: "Avg Response", ar: "متوسط الاستجابة" },
    "No pending questions": { en: "No pending questions -- all caught up!", ar: "لا توجد أسئلة معلقة -- تم الرد على الكل!" },
    "Answered Questions (slowest first)": { en: "Answered Questions (slowest first)", ar: "الأسئلة المُجابة (الأبطأ أولاً)" },
    "No answered questions yet": { en: "No answered questions yet.", ar: "لا توجد أسئلة مُجابة بعد." },
    "response time": { en: "response time", ar: "وقت الاستجابة" },
    "Response Summary": { en: "Response Summary", ar: "ملخص الاستجابة" },
    "Fastest Response": { en: "Fastest Response", ar: "أسرع استجابة" },
    "Slowest Response": { en: "Slowest Response", ar: "أبطأ استجابة" },
    "Avg Response by Channel": { en: "Avg Response by Channel", ar: "متوسط الاستجابة حسب القناة" },
    "No data": { en: "No data", ar: "لا توجد بيانات" },

    // Workload view
    "Team Members": { en: "Team Members", ar: "أعضاء الفريق" },
    "assigned": { en: "assigned", ar: "مُسند" },
    "capacity": { en: "capacity", ar: "السعة" },
    "completed": { en: "completed", ar: "مكتمل" },
    "switches": { en: "switches", ar: "تبديلات" },
    "active tasks": { en: "active tasks", ar: "المهام النشطة" },
    "Assigned": { en: "Assigned", ar: "مُسند" },
    "Over capacity": { en: "Over capacity", ar: "تجاوز السعة" },
    "Capacity limit": { en: "Capacity limit", ar: "حد السعة" },
    "No workload data": { en: "No workload data", ar: "لا توجد بيانات عبء عمل" },
    "No workload data available for this sprint": { en: "No workload data available for this sprint.", ar: "لا توجد بيانات عبء عمل متاحة لهذا السبرنت." },

    // Reports view
    "Current Sprint": { en: "Current Sprint", ar: "السبرنت الحالي" },
    "Overall Sprint Health": { en: "Overall Sprint Health", ar: "صحة السبرنت الإجمالية" },
    "Health Score": { en: "Health Score", ar: "مؤشر الصحة" },
    "Completion": { en: "Completion", ar: "الإنجاز" },
    "Related Metrics": { en: "Related Metrics", ar: "المقاييس ذات الصلة" },
    "Detailed breakdown of the six friction areas impacting team delivery": { en: "Detailed breakdown of the six friction areas impacting team delivery", ar: "تحليل مفصل لمناطق الاحتكاك الست المؤثرة على تسليم الفريق" },

    // Friction area labels
    "Poor Requirements": { en: "Poor Requirements", ar: "متطلبات ضعيفة" },
    "Communication Gaps": { en: "Communication Gaps", ar: "فجوات التواصل" },
    "Weak Ownership": { en: "Weak Ownership", ar: "ملكية ضعيفة" },
    "Dependency Blockers": { en: "Dependency Blockers", ar: "عوائق التبعيات" },
    "Process Gaps": { en: "Process Gaps", ar: "فجوات العمليات" },
    "Team & Culture": { en: "Team & Culture", ar: "الفريق والثقافة" },

    // Analytics view
    "Sprint Health Comparison": { en: "Sprint Health Comparison", ar: "مقارنة صحة السبرنتات" },
    "Sprint-over-Sprint Trends": { en: "Sprint-over-Sprint Trends", ar: "اتجاهات السبرنت مقارنةً" },
    "Health Score Breakdown": { en: "Health Score Breakdown", ar: "تفصيل مؤشر الصحة" },
    "Overall Health Score": { en: "Overall Health Score", ar: "مؤشر الصحة الإجمالي" },
    "Composite score derived from 6 friction areas": { en: "Composite score derived from 6 friction areas. Each area contributes to the overall sprint health.", ar: "مؤشر مركّب مشتق من 6 مناطق احتكاك. كل منطقة تساهم في صحة السبرنت الإجمالية." },
    "No metrics data available for this sprint": { en: "No metrics data available for this sprint.", ar: "لا توجد بيانات مقاييس متاحة لهذا السبرنت." },
    "No friction data available for this sprint": { en: "No friction data available for this sprint.", ar: "لا توجد بيانات احتكاك متاحة لهذا السبرنت." },
    "Overall": { en: "Overall", ar: "إجمالي" },

    // Ownership view
    "No Ownership Data": { en: "No Ownership Data", ar: "لا توجد بيانات ملكية" },
    "No ownership entries available": { en: "No ownership entries available. Add components to start mapping ownership.", ar: "لا توجد إدخالات ملكية متاحة. أضف مكونات لبدء تعيين الملكية." },
    "With Conflicts": { en: "With Conflicts", ar: "بها تعارضات" },
    "All Components": { en: "All Components", ar: "جميع المكونات" },
    "Primary Owner": { en: "Primary Owner", ar: "المالك الأساسي" },
    "Backup Owner": { en: "Backup Owner", ar: "المالك الاحتياطي" },

    // Handoffs view
    "No Handoffs": { en: "No Handoffs", ar: "لا توجد تسليمات" },
    "No handoff data available for the current sprint": { en: "No handoff data available for the current sprint.", ar: "لا توجد بيانات تسليم متاحة للسبرنت الحالي." },
    "Task": { en: "Task", ar: "المهمة" },

    // Tasks view
    "No tasks found": { en: "No tasks found", ar: "لا توجد مهام" },
    "No tasks assigned to the current sprint": { en: "There are no tasks assigned to the current sprint.", ar: "لا توجد مهام مسندة للسبرنت الحالي." },
    "Priority": { en: "Priority", ar: "الأولوية" },
    "Transition Criteria": { en: "Transition Criteria", ar: "معايير الانتقال" },
    "Required Criteria": { en: "Required Criteria", ar: "المعايير المطلوبة" },
    "Moving back": { en: "Moving back", ar: "الرجوع" },
    "Moving forward": { en: "Moving forward", ar: "التقدم" },
    "points": { en: "points", ar: "نقاط" },

    // Common labels
    "Impact": { en: "Impact", ar: "التأثير" },
    "Duration": { en: "Duration", ar: "المدة" },
    "Type": { en: "Type", ar: "النوع" },
    "Category": { en: "Category", ar: "الفئة" },

    // Profile view
    "Team": { en: "Team", ar: "الفريق" },
    "Cairo, Egypt": { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
    "Joined": { en: "Joined", ar: "انضم" },
    "Active Member": { en: "Active Member", ar: "عضو نشط" },
    "Sprint Health": { en: "Sprint Health", ar: "صحة السبرنت" },

    // Login page
    "Sign in to your account": { en: "Sign in to your account", ar: "تسجيل الدخول إلى حسابك" },
    "Password": { en: "Password", ar: "كلمة المرور" },
    "Enter your email": { en: "Enter your email", ar: "أدخل بريدك الإلكتروني" },
    "Enter your password": { en: "Enter your password", ar: "أدخل كلمة المرور" },
    "Demo Credentials": { en: "Demo Credentials", ar: "بيانات الدخول التجريبية" },
    "Invalid credentials. Please try again.": { en: "Invalid credentials. Please try again.", ar: "بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى." },

    // Error boundary
    "Something Went Wrong": { en: "Something Went Wrong", ar: "حدث خطأ ما" },
    "An unexpected error occurred while loading this page.": { en: "An unexpected error occurred while loading this page.", ar: "حدث خطأ غير متوقع أثناء تحميل هذه الصفحة." },
    "An unexpected error occurred": { en: "An unexpected error occurred", ar: "حدث خطأ غير متوقع" },
    "An unexpected error occurred. The error has been logged and our team will look into it.": { en: "An unexpected error occurred. The error has been logged and our team will look into it.", ar: "حدث خطأ غير متوقع. تم تسجيل الخطأ وسيقوم فريقنا بمراجعته." },
    "Connection Error": { en: "Connection Error", ar: "خطأ في الاتصال" },
    "Unable to connect to the server. Please check your internet connection and try again.": { en: "Unable to connect to the server. Please check your internet connection and try again.", ar: "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." },
    "Reload Page": { en: "Reload Page", ar: "إعادة تحميل الصفحة" },
    "Go to Dashboard": { en: "Go to Dashboard", ar: "الذهاب إلى لوحة التحكم" },
    "Show Technical Details": { en: "Show Technical Details", ar: "عرض التفاصيل التقنية" },
    "Hide Technical Details": { en: "Hide Technical Details", ar: "إخفاء التفاصيل التقنية" },
    "Stack Trace": { en: "Stack Trace", ar: "تتبع الخطأ" },
    "Copy": { en: "Copy", ar: "نسخ" },
    "Copied!": { en: "Copied!", ar: "تم النسخ!" },
};

export const t = (key: string): string => {
    const lang = getSettings().language;
    return translations[key]?.[lang] ?? key;
};
