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
    "English": { en: "English", ar: "الإنجليزية" },
    "Arabic": { en: "Arabic", ar: "العربية" },
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

    // Error pages
    "Page Not Found": { en: "Page Not Found", ar: "الصفحة غير موجودة" },
    "The page you're looking for doesn't exist or has been moved. Let's get you back on track.": { en: "The page you're looking for doesn't exist or has been moved. Let's get you back on track.", ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. دعنا نعيدك إلى المسار الصحيح." },
    "Go Back": { en: "Go Back", ar: "الرجوع" },
    "Server Error": { en: "Server Error", ar: "خطأ في الخادم" },
    "Something went wrong on our end. Our team has been notified and is working on a fix. Please try again shortly.": { en: "Something went wrong on our end. Our team has been notified and is working on a fix. Please try again shortly.", ar: "حدث خطأ من جهتنا. تم إبلاغ فريقنا وهو يعمل على إصلاحه. يرجى المحاولة مرة أخرى قريباً." },
    "Try Again": { en: "Try Again", ar: "حاول مرة أخرى" },

    // Init loader
    "Preparing your workspace": { en: "Preparing your workspace", ar: "جارٍ تهيئة مساحة العمل" },

    // Load more / pagination
    "You've viewed": { en: "You've viewed", ar: "لقد استعرضت" },
    "of": { en: "of", ar: "من" },
    "Reset": { en: "Reset", ar: "إعادة تعيين" },
    "All caught up": { en: "All caught up", ar: "تم عرض الكل" },
    "Load": { en: "Load", ar: "تحميل" },
    "more": { en: "more", ar: "المزيد" },
    "Step": { en: "Step", ar: "الخطوة" },
    "teams": { en: "teams", ar: "فريق" },

    // Reports section titles
    "Delivery": { en: "Delivery", ar: "التسليم" },
    "Meetings": { en: "Meetings", ar: "الاجتماعات" },
    "Friction": { en: "Friction", ar: "الاحتكاك" },
    "Project context and attention items": { en: "Project context and attention items", ar: "سياق المشروع والعناصر التي تحتاج اهتماماً" },
    "Completion rate, on-time delivery, and blockers": { en: "Completion rate, on-time delivery, and blockers", ar: "معدل الإنجاز والتسليم في الوقت المحدد والعوائق" },
    "Team capacity and story point utilisation": { en: "Team capacity and story point utilisation", ar: "سعة الفريق واستخدام نقاط القصة" },
    "Phase transition criteria completion across sprints": { en: "Phase transition criteria completion across sprints", ar: "اكتمال معايير انتقال المراحل عبر السبرنتات" },
    "Feature and task authorship by team member": { en: "Feature and task authorship by team member", ar: "نسب الميزات والمهام لأعضاء الفريق" },
    "Meeting log for this project": { en: "Meeting log for this project", ar: "سجل الاجتماعات لهذا المشروع" },
    "Blocker categories and average resolution time": { en: "Blocker categories and average resolution time", ar: "فئات العوائق ومتوسط وقت الحل" },

    // Sidebar nav items
    "Projects": { en: "Projects", ar: "المشاريع" },
    "Comments Log": { en: "Comments Log", ar: "سجل التعليقات" },
    "Red Flags": { en: "Red Flags", ar: "التنبيهات الحمراء" },
    "Alerts": { en: "Alerts", ar: "التنبيهات" },
    "Users": { en: "Users", ar: "المستخدمون" },
    "Teams": { en: "Teams", ar: "الفرق" },
    "Delivery Analytics": { en: "Delivery Analytics", ar: "تحليلات التسليم" },
    "Gantt": { en: "Gantt", ar: "مخطط جانت" },
    "Time": { en: "Time", ar: "الوقت" },
    "Deploys": { en: "Deploys", ar: "النشرات" },
    "Reminders": { en: "Reminders", ar: "التذكيرات" },
    "Coming soon": { en: "Coming soon", ar: "قريباً" },

    // Dashboard
    "Sprint Performance Score": { en: "Sprint Performance Score", ar: "مؤشر أداء السبرنت" },
    "Alert Response": { en: "Alert Response", ar: "استجابة التنبيهات" },
    "Red Flag Response": { en: "Red Flag Response", ar: "استجابة التنبيهات الحمراء" },
    "Time Delivery": { en: "Time Delivery", ar: "التسليم في الوقت" },
    "Comments Response": { en: "Comments Response", ar: "استجابة التعليقات" },
    "Not Approval (%)": { en: "Not Approval (%)", ar: "غير موافق (%)" },
    "Performance Metrics": { en: "Performance Metrics", ar: "مقاييس الأداء" },
    "Where friction is coming from": { en: "Where friction is coming from", ar: "مصادر الاحتكاك" },

    // Common buttons / actions
    "Add": { en: "Add", ar: "إضافة" },
    "Save": { en: "Save", ar: "حفظ" },
    "Create": { en: "Create", ar: "إنشاء" },
    "Edit": { en: "Edit", ar: "تعديل" },
    "Delete": { en: "Delete", ar: "حذف" },
    "Remove": { en: "Remove", ar: "إزالة" },
    "Upload": { en: "Upload", ar: "رفع" },
    "Back": { en: "Back", ar: "رجوع" },
    "Close": { en: "Close", ar: "إغلاق" },
    "Accept": { en: "Accept", ar: "قبول" },
    "Approve": { en: "Approve", ar: "موافقة" },
    "Reject": { en: "Reject", ar: "رفض" },
    "Activate": { en: "Activate", ar: "تفعيل" },
    "Clear": { en: "Clear", ar: "مسح" },
    "Clear all": { en: "Clear all", ar: "مسح الكل" },
    "Clear filters": { en: "Clear filters", ar: "مسح المرشحات" },
    "Respond": { en: "Respond", ar: "استجابة" },
    "Vote": { en: "Vote", ar: "تصويت" },
    "Start": { en: "Start", ar: "بدء" },
    "View Details": { en: "View Details", ar: "عرض التفاصيل" },
    "View Members": { en: "View Members", ar: "عرض الأعضاء" },
    "View Sprints": { en: "View Sprints", ar: "عرض السبرنتات" },
    "View Tasks": { en: "View Tasks", ar: "عرض المهام" },
    "View By": { en: "View By", ar: "عرض حسب" },
    "Required": { en: "Required", ar: "مطلوب" },
    "optional": { en: "optional", ar: "اختياري" },
    "selected": { en: "selected", ar: "محدد" },
    "No": { en: "No", ar: "لا" },
    "Yes": { en: "Yes", ar: "نعم" },
    "This cannot be undone.": { en: "This cannot be undone.", ar: "لا يمكن التراجع عن هذا." },
    "This action cannot be undone.": { en: "This action cannot be undone.", ar: "لا يمكن التراجع عن هذا الإجراء." },
    "Are you sure?": { en: "Are you sure?", ar: "هل أنت متأكد؟" },
    "Try adjusting your filters or search query.": { en: "Try adjusting your filters or search query.", ar: "حاول تعديل المرشحات أو استعلام البحث." },
    "No matches": { en: "No matches", ar: "لا توجد نتائج" },

    // Task dialog
    "Add New Task": { en: "Add New Task", ar: "إضافة مهمة جديدة" },
    "Create a new task and assign it to a team member": { en: "Create a new task and assign it to a team member", ar: "إنشاء مهمة جديدة وتعيينها لعضو في الفريق" },
    "Title": { en: "Title", ar: "العنوان" },
    "Enter task title": { en: "Enter task title", ar: "أدخل عنوان المهمة" },
    "Enter task description...": { en: "Enter task description...", ar: "أدخل وصف المهمة..." },
    "Add a requirement...": { en: "Add a requirement...", ar: "أضف متطلباً..." },
    "Add a tag...": { en: "Add a tag...", ar: "أضف وسماً..." },
    "Attachments": { en: "Attachments", ar: "المرفقات" },
    "Choose files": { en: "Choose files", ar: "اختر الملفات" },
    "Assigned To": { en: "Assigned To", ar: "مسند إلى" },
    "Select assignee": { en: "Select assignee", ar: "اختر المسؤول" },
    "Estimated Hours": { en: "Estimated Hours", ar: "الساعات المقدرة" },
    "Hours": { en: "Hours", ar: "ساعات" },
    "Dead Time": { en: "Dead Time", ar: "الموعد النهائي" },
    "Task Type": { en: "Task Type", ar: "نوع المهمة" },
    "Stand-alone": { en: "Stand-alone", ar: "مستقلة" },
    "Compound": { en: "Compound", ar: "مركبة" },
    "Start only if other task done": { en: "Start only if other task done", ar: "ابدأ فقط إذا انتهت المهمة الأخرى" },
    "Notify others when done": { en: "Notify others when done", ar: "إشعار الآخرين عند الانتهاء" },
    "Search tasks in this sprint...": { en: "Search tasks in this sprint...", ar: "البحث في مهام السبرنت..." },
    "Search users to notify...": { en: "Search users to notify...", ar: "البحث عن مستخدمين للإشعار..." },
    "Task Number": { en: "Task Number", ar: "رقم المهمة" },
    "Task Title": { en: "Task Title", ar: "عنوان المهمة" },
    "Title is required": { en: "Title is required", ar: "العنوان مطلوب" },
    "Assignee is required": { en: "Assignee is required", ar: "المسؤول مطلوب" },
    "Estimated hours is required": { en: "Estimated hours is required", ar: "الساعات المقدرة مطلوبة" },
    "Task created, but some extras (requirements/tags/attachments) failed.": { en: "Task created, but some extras (requirements/tags/attachments) failed.", ar: "تم إنشاء المهمة، لكن بعض الإضافات فشلت." },
    "Awaiting Approval": { en: "Awaiting Approval", ar: "في انتظار الموافقة" },
    "Awaiting PM approval": { en: "Awaiting PM approval", ar: "في انتظار موافقة مدير المشروع" },
    "Finish": { en: "Finish", ar: "إنهاء" },
    "Task Rejection": { en: "Task Rejection", ar: "رفض المهمة" },
    "Task completion review": { en: "Task completion review", ar: "مراجعة إتمام المهمة" },
    "Task completion": { en: "Task completion", ar: "إتمام المهمة" },
    "Requirements approved": { en: "Requirements approved", ar: "تمت الموافقة على المتطلبات" },
    "All criteria met. Ready to move forward.": { en: "All criteria met. Ready to move forward.", ar: "تم استيفاء جميع المعايير. جاهز للمضي قدماً." },
    "Some criteria are not yet met.": { en: "Some criteria are not yet met.", ar: "لم يتم استيفاء بعض المعايير بعد." },
    "Use the task detail dialog to move tasks between phases.": { en: "Use the task detail dialog to move tasks between phases.", ar: "استخدم نافذة تفاصيل المهمة لنقل المهام بين المراحل." },
    "Blocked Tasks": { en: "Blocked Tasks", ar: "المهام المحظورة" },
    "Blocked by dependency": { en: "Blocked by dependency", ar: "محجوب بتبعية" },
    "Add Task": { en: "Add Task", ar: "إضافة مهمة" },
    "Create Task": { en: "Create Task", ar: "إنشاء مهمة" },
    "Kanban": { en: "Kanban", ar: "كانبان" },
    "Search tasks...": { en: "Search tasks...", ar: "البحث في المهام..." },
    "Search by task name...": { en: "Search by task name...", ar: "البحث باسم المهمة..." },
    "Bug": { en: "Bug", ar: "خلل" },
    "Feature": { en: "Feature", ar: "ميزة" },
    "Transition": { en: "Transition", ar: "الانتقال" },
    "No note": { en: "No note", ar: "لا ملاحظة" },
    "Checked": { en: "Checked", ar: "تم التحقق" },
    "Why are you moving this task back?": { en: "Why are you moving this task back?", ar: "لماذا تُعيد هذه المهمة للخلف؟" },
    "Status will be set to Pending — a PM must approve before it takes effect.": { en: "Status will be set to Pending — a PM must approve before it takes effect.", ar: "سيتم تعيين الحالة إلى معلق — يجب أن يوافق مدير المشروع قبل التطبيق." },
    "Set Pending": { en: "Set Pending", ar: "تعيين معلق" },
    "Set Status": { en: "Set Status", ar: "تعيين الحالة" },
    "Change Status": { en: "Change Status", ar: "تغيير الحالة" },
    "Request Move Back": { en: "Request Move Back", ar: "طلب العودة للخلف" },
    "Attach": { en: "Attach", ar: "إرفاق" },
    "Remove file": { en: "Remove file", ar: "إزالة الملف" },
    "Click to upload files": { en: "Click to upload files", ar: "انقر لرفع الملفات" },
    "Up to 250 MB · any format": { en: "Up to 250 MB · any format", ar: "حتى 250 ميغابايت · أي تنسيق" },

    // Time logs
    "Time Logs": { en: "Time Logs", ar: "سجل الوقت" },
    "What did you work on?": { en: "What did you work on?", ar: "ماذا عملت؟" },
    "What did you work on? (optional)": { en: "What did you work on? (optional)", ar: "ماذا عملت؟ (اختياري)" },
    "Total Logged": { en: "Total Logged", ar: "الإجمالي المسجّل" },
    "Total Estimated": { en: "Total Estimated", ar: "الإجمالي المقدر" },
    "Log": { en: "Log", ar: "تسجيل" },
    "pts": { en: "pts", ar: "نقطة" },
    "logged": { en: "logged", ar: "مسجّل" },
    "e.g. 4.5": { en: "e.g. 4.5", ar: "مثل: 4.5" },
    "Select a task to view time tracking.": { en: "Select a task to view time tracking.", ar: "اختر مهمة لعرض تتبع الوقت." },
    "Select a user to view time tracking.": { en: "Select a user to view time tracking.", ar: "اختر مستخدماً لعرض تتبع الوقت." },
    "Track hours across sprints, users, and tasks.": { en: "Track hours across sprints, users, and tasks.", ar: "تتبع الساعات عبر السبرنتات والمستخدمين والمهام." },

    // Comments
    "Comments": { en: "Comments", ar: "التعليقات" },
    "No comments yet": { en: "No comments yet", ar: "لا توجد تعليقات بعد" },
    "Add Comment": { en: "Add Comment", ar: "إضافة تعليق" },
    "Add a comment...": { en: "Add a comment...", ar: "أضف تعليقاً..." },
    "Write a comment...": { en: "Write a comment...", ar: "اكتب تعليقاً..." },
    "Write a comment… type @ to mention": { en: "Write a comment… type @ to mention", ar: "اكتب تعليقاً... اكتب @ للإشارة" },
    "Track all task comments, mentions, and responses": { en: "Track all task comments, mentions, and responses", ar: "تتبع جميع تعليقات المهام والإشارات والردود" },
    "No comments found for the current sprint": { en: "No comments found for the current sprint", ar: "لا توجد تعليقات للسبرنت الحالي" },
    "No Comments": { en: "No Comments", ar: "لا توجد تعليقات" },
    "With Mention": { en: "With Mention", ar: "مع إشارة" },
    "All Mentions": { en: "All Mentions", ar: "جميع الإشارات" },
    "Comments Activity": { en: "Comments Activity", ar: "نشاط التعليقات" },
    "Written": { en: "Written", ar: "مكتوبة" },
    "Total Comments": { en: "Total Comments", ar: "إجمالي التعليقات" },
    "Comment Details": { en: "Comment Details", ar: "تفاصيل التعليق" },
    "Responded": { en: "Responded", ar: "تمت الاستجابة" },
    "Responded Comments": { en: "Responded Comments", ar: "التعليقات المُجاب عليها" },
    "Mention response rate": { en: "Mention response rate", ar: "معدل الرد على الإشارات" },
    "Mentioned in": { en: "Mentioned in", ar: "مُشار إليه في" },
    "Answer Rate": { en: "Answer Rate", ar: "معدل الإجابة" },
    "Written by": { en: "Written by", ar: "بقلم" },
    "Response": { en: "Response", ar: "الاستجابة" },
    "Comment": { en: "Comment", ar: "تعليق" },

    // Blockers
    "Add Blocker": { en: "Add Blocker", ar: "إضافة عائق" },
    "Create Blocker": { en: "Create Blocker", ar: "إنشاء عائق" },
    "Mark as Resolved": { en: "Mark as Resolved", ar: "وضع علامة كمحلول" },
    "Escalate": { en: "Escalate", ar: "تصعيد" },
    "Linked Tasks": { en: "Linked Tasks", ar: "المهام المرتبطة" },
    "No tasks linked": { en: "No tasks linked", ar: "لا توجد مهام مرتبطة" },
    "linked tasks": { en: "linked tasks", ar: "مهام مرتبطة" },
    "Delete this blocker? This cannot be undone.": { en: "Delete this blocker? This cannot be undone.", ar: "حذف هذا العائق؟ لا يمكن التراجع عن هذا." },
    "Blocker Activity": { en: "Blocker Activity", ar: "نشاط العوائق" },
    "All Severities": { en: "All Severities", ar: "جميع درجات الخطورة" },
    "All Reporters": { en: "All Reporters", ar: "جميع المُبلِّغين" },
    "Reporter": { en: "Reporter", ar: "المُبلِّغ" },
    "Reported": { en: "Reported", ar: "مُبلَّغ عنه" },
    "Owned": { en: "Owned", ar: "مملوك" },
    "Stalled": { en: "Stalled", ar: "راكدة" },
    "Stalled Red Flags": { en: "Stalled Red Flags", ar: "التنبيهات الحمراء الراكدة" },
    "Total Red Flags": { en: "Total Red Flags", ar: "إجمالي التنبيهات الحمراء" },
    "Severity": { en: "Severity", ar: "درجة الخطورة" },
    "Urgency": { en: "Urgency", ar: "درجة الإلحاح" },
    "All Urgencies": { en: "All Urgencies", ar: "جميع درجات الإلحاح" },

    // Red flags
    "Add Red Flag": { en: "Add Red Flag", ar: "إضافة تنبيه أحمر" },
    "No red flags": { en: "No red flags", ar: "لا توجد تنبيهات حمراء" },
    "No risks identified for this sprint.": { en: "No risks identified for this sprint.", ar: "لا توجد مخاطر محددة لهذا السبرنت." },
    "Track and manage sprint risk indicators.": { en: "Track and manage sprint risk indicators.", ar: "تتبع وإدارة مؤشرات مخاطر السبرنت." },
    "Describe the risk": { en: "Describe the risk", ar: "وصف المخاطرة" },
    "Short summary": { en: "Short summary", ar: "ملخص قصير" },

    // Alerts
    "No pending alerts": { en: "No pending alerts", ar: "لا توجد تنبيهات معلقة" },
    "Create announcements and track acknowledgements.": { en: "Create announcements and track acknowledgements.", ar: "إنشاء إعلانات وتتبع الإقرارات." },
    "All clear!": { en: "All clear!", ar: "كل شيء على ما يرام!" },
    "Alert title": { en: "Alert title", ar: "عنوان التنبيه" },
    "Create Alert": { en: "Create Alert", ar: "إنشاء تنبيه" },
    "Urgent Alerts": { en: "Urgent Alerts", ar: "تنبيهات عاجلة" },
    "Acknowledge": { en: "Acknowledge", ar: "إقرار" },
    "Acknowledged": { en: "Acknowledged", ar: "تم الإقرار" },
    "Ack Rate": { en: "Ack Rate", ar: "معدل الإقرار" },
    "Acknowledgement rate": { en: "Acknowledgement rate", ar: "معدل الإقرار" },
    "Received": { en: "Received", ar: "مستلَم" },
    "Raised by user": { en: "Raised by user", ar: "أثاره المستخدم" },
    "Total in sprint": { en: "Total in sprint", ar: "الإجمالي في السبرنت" },
    "Alerts Engagement": { en: "Alerts Engagement", ar: "مشاركة التنبيهات" },
    "All": { en: "All", ar: "الكل" },
    "Body": { en: "Body", ar: "المحتوى" },
    "System": { en: "System", ar: "النظام" },
    "Are you sure you want to delete": { en: "Are you sure you want to delete", ar: "هل أنت متأكد من حذف" },

    // Projects
    "Add Project": { en: "Add Project", ar: "إضافة مشروع" },
    "Create Project": { en: "Create Project", ar: "إنشاء مشروع" },
    "Edit Project": { en: "Edit Project", ar: "تعديل مشروع" },
    "Group your sprints into projects.": { en: "Group your sprints into projects.", ar: "نظّم سبرنتاتك في مشاريع." },
    "Create your first project to start organizing sprints.": { en: "Create your first project to start organizing sprints.", ar: "أنشئ مشروعك الأول لبدء تنظيم السبرنتات." },
    "No projects yet": { en: "No projects yet", ar: "لا توجد مشاريع بعد" },
    "What is this project about?": { en: "What is this project about?", ar: "ما موضوع هذا المشروع؟" },
    "Back to Projects": { en: "Back to Projects", ar: "العودة إلى المشاريع" },
    "sprints": { en: "sprints", ar: "سبرنت" },
    "Sprints": { en: "Sprints", ar: "السبرنتات" },
    "Active Sprints": { en: "Active Sprints", ar: "السبرنتات النشطة" },
    "Sprint": { en: "Sprint", ar: "السبرنت" },

    // Sprints
    "Add Sprint": { en: "Add Sprint", ar: "إضافة سبرنت" },
    "Create Sprint": { en: "Create Sprint", ar: "إنشاء سبرنت" },
    "Start Date": { en: "Start Date", ar: "تاريخ البداية" },
    "Create your first sprint to start planning work.": { en: "Create your first sprint to start planning work.", ar: "أنشئ أول سبرنت لبدء تخطيط العمل." },
    "Back to Sprints": { en: "Back to Sprints", ar: "العودة إلى السبرنتات" },
    "Sprint delivery metrics": { en: "Sprint delivery metrics", ar: "مقاييس تسليم السبرنت" },
    "Sprint delivery metrics — completion rate, story points, and task breakdown.": { en: "Sprint delivery metrics — completion rate, story points, and task breakdown.", ar: "مقاييس تسليم السبرنت — معدل الإنجاز ونقاط القصة وتقسيم المهام." },
    "Sprint progress": { en: "Sprint progress", ar: "تقدم السبرنت" },
    "Create and activate a sprint to see analytics.": { en: "Create and activate a sprint to see analytics.", ar: "أنشئ سبرنتاً وفعّله لعرض التحليلات." },

    // Teams
    "Add Team": { en: "Add Team", ar: "إضافة فريق" },
    "Create Team": { en: "Create Team", ar: "إنشاء فريق" },
    "Organize members into teams.": { en: "Organize members into teams.", ar: "نظّم الأعضاء في فرق." },
    "Create your first team to group members.": { en: "Create your first team to group members.", ar: "أنشئ أول فريق لتجميع الأعضاء." },
    "Back to Teams": { en: "Back to Teams", ar: "العودة إلى الفرق" },
    "What does this team do?": { en: "What does this team do?", ar: "ما عمل هذا الفريق؟" },
    "Team analytics are not yet available from the backend.": { en: "Team analytics are not yet available from the backend.", ar: "تحليلات الفريق غير متاحة بعد من الخادم." },
    "members": { en: "members", ar: "عضو" },
    "Leadership": { en: "Leadership", ar: "القيادة" },
    "Resolve Rate": { en: "Resolve Rate", ar: "معدل الحل" },

    // Users
    "User Management": { en: "User Management", ar: "إدارة المستخدمين" },
    "Manage team members and view individual performance analytics": { en: "Manage team members and view individual performance analytics", ar: "إدارة أعضاء الفريق وعرض تحليلات الأداء الفردي" },
    "Add User": { en: "Add User", ar: "إضافة مستخدم" },
    "Add Member": { en: "Add Member", ar: "إضافة عضو" },
    "Add Team Member": { en: "Add Team Member", ar: "إضافة عضو للفريق" },
    "No Users": { en: "No Users", ar: "لا يوجد مستخدمون" },
    "Add team members to get started": { en: "Add team members to get started", ar: "أضف أعضاء الفريق للبدء" },
    "Full Name": { en: "Full Name", ar: "الاسم الكامل" },
    "Role Title": { en: "Role Title", ar: "مسمى الدور" },
    "Role Tier": { en: "Role Tier", ar: "مستوى الدور" },
    "Back to Users": { en: "Back to Users", ar: "العودة إلى المستخدمين" },
    "User not found": { en: "User not found", ar: "المستخدم غير موجود" },
    "No Team": { en: "No Team", ar: "بلا فريق" },

    // User detail analytics
    "Delivery Rate": { en: "Delivery Rate", ar: "معدل التسليم" },
    "Points Done": { en: "Points Done", ar: "النقاط المنجزة" },
    "Tasks by Phase": { en: "Tasks by Phase", ar: "المهام حسب المرحلة" },
    "Communication Performance": { en: "Communication Performance", ar: "أداء التواصل" },
    "Quick Stats": { en: "Quick Stats", ar: "إحصائيات سريعة" },
    "Tasks assigned": { en: "Tasks assigned", ar: "المهام المسندة" },
    "Comm. response": { en: "Comm. response", ar: "استجابة التواصل" },
    "Blocker resolve": { en: "Blocker resolve", ar: "حل العوائق" },
    "avg": { en: "avg", ar: "متوسط" },
    "Questions Asked": { en: "Questions Asked", ar: "الأسئلة المطروحة" },
    "Questions Received": { en: "Questions Received", ar: "الأسئلة المستلمة" },
    "Response Rate": { en: "Response Rate", ar: "معدل الاستجابة" },
    "Response time distribution": { en: "Response time distribution", ar: "توزيع وقت الاستجابة" },
    "User activated": { en: "User activated", ar: "تم تفعيل المستخدم" },
    "User deactivated": { en: "User deactivated", ar: "تم تعطيل المستخدم" },

    // Delivery analytics
    "Tasks Completed": { en: "Tasks Completed", ar: "المهام المكتملة" },
    "Completion Rate": { en: "Completion Rate", ar: "معدل الإنجاز" },
    "Story Point Rate": { en: "Story Point Rate", ar: "معدل نقاط القصة" },
    "Story point completion": { en: "Story point completion", ar: "إتمام نقاط القصة" },
    "Story points completed per sprint": { en: "Story points completed per sprint", ar: "نقاط القصة المكتملة لكل سبرنت" },
    "Tasks by Status": { en: "Tasks by Status", ar: "المهام حسب الحالة" },
    "Tasks by Priority": { en: "Tasks by Priority", ar: "المهام حسب الأولوية" },
    "Tasks completed per day": { en: "Tasks completed per day", ar: "المهام المكتملة يومياً" },
    "By Sprint": { en: "By Sprint", ar: "حسب السبرنت" },
    "By Project": { en: "By Project", ar: "حسب المشروع" },
    "By User": { en: "By User", ar: "حسب المستخدم" },
    "Select Project": { en: "Select Project", ar: "اختر المشروع" },
    "Select Sprint": { en: "Select Sprint", ar: "اختر السبرنت" },
    "Select project": { en: "Select project", ar: "اختر المشروع" },
    "Select sprint": { en: "Select sprint", ar: "اختر السبرنت" },

    // Gantt
    "Visualize task timelines by sprint or project.": { en: "Visualize task timelines by sprint or project.", ar: "تصوير الجداول الزمنية للمهام حسب السبرنت أو المشروع." },
    "Select a sprint or project and adjust filters.": { en: "Select a sprint or project and adjust filters.", ar: "اختر سبرنتاً أو مشروعاً وعدّل المرشحات." },
    "no dates": { en: "no dates", ar: "بلا تواريخ" },
    "No tasks to display.": { en: "No tasks to display.", ar: "لا توجد مهام للعرض." },

    // Deploys
    "Build artifacts and changelog history. Managers are notified on each upload.": { en: "Build artifacts and changelog history. Managers are notified on each upload.", ar: "قطع البناء وسجل التغييرات. يتم إبلاغ المديرين عند كل رفع." },
    "Submit Deploy": { en: "Submit Deploy", ar: "رفع نشرة" },
    "Upload a build artifact. Managers receive a notification when this is submitted.": { en: "Upload a build artifact. Managers receive a notification when this is submitted.", ar: "ارفع قطعة بناء. يتلقى المديرون إشعاراً عند التقديم." },
    "Upload your first build to start the changelog.": { en: "Upload your first build to start the changelog.", ar: "ارفع أول بناء لبدء سجل التغييرات." },
    "Total Deploys": { en: "Total Deploys", ar: "إجمالي النشرات" },
    "Uploader": { en: "Uploader", ar: "الرافع" },
    "All Uploaders": { en: "All Uploaders", ar: "جميع الرافعين" },
    "All Environments": { en: "All Environments", ar: "جميع البيئات" },
    "Production": { en: "Production", ar: "الإنتاج" },
    "Staging": { en: "Staging", ar: "التجهيز" },
    "Preview": { en: "Preview", ar: "المعاينة" },
    "Rolled Back": { en: "Rolled Back", ar: "تم الاسترجاع" },
    "Search title, file, version…": { en: "Search title, file, version…", ar: "البحث في العنوان أو الملف أو الإصدار..." },
    "All Owners": { en: "All Owners", ar: "جميع المالكين" },
    "All Projects": { en: "All Projects", ar: "جميع المشاريع" },
    "Updated": { en: "Updated", ar: "مُحدَّث" },

    // Reminders
    "Subscription, certificate, and renewal alerts. Get pinged at each interval before expiry.": { en: "Subscription, certificate, and renewal alerts. Get pinged at each interval before expiry.", ar: "تنبيهات الاشتراكات والشهادات والتجديدات. احصل على تنبيه عند كل فترة قبل انتهاء الصلاحية." },
    "Create Reminder": { en: "Create Reminder", ar: "إنشاء تذكير" },
    "Create your first reminder to get notified before things expire.": { en: "Create your first reminder to get notified before things expire.", ar: "أنشئ أول تذكير للحصول على إشعار قبل انتهاء الصلاحيات." },
    "Search reminders…": { en: "Search reminders…", ar: "البحث في التذكيرات..." },
    "Critical (≤3d)": { en: "Critical (≤3d)", ar: "حرج (≤3 أيام)" },
    "Approaching deadline": { en: "Approaching deadline", ar: "يقترب الموعد" },
    "Comfortable": { en: "Comfortable", ar: "مريح" },
    "Soon (≤30d)": { en: "Soon (≤30d)", ar: "قريباً (≤30 يوم)" },
    "This Week": { en: "This Week", ar: "هذا الأسبوع" },
    "Context, links, or any details you want surfaced when this fires.": { en: "Context, links, or any details you want surfaced when this fires.", ar: "سياق أو روابط أو أي تفاصيل تريد ظهورها عند الإطلاق." },
    "We'll notify you at each selected interval before the expiry date.": { en: "We'll notify you at each selected interval before the expiry date.", ar: "سنُبلغك عند كل فترة محددة قبل تاريخ الانتهاء." },
    "Auto deadline alarm": { en: "Auto deadline alarm", ar: "إنذار الموعد النهائي التلقائي" },
    "expires": { en: "expires", ar: "تنتهي" },
    "intervals": { en: "intervals", ar: "فترات" },
    "Expired": { en: "Expired", ar: "منتهية الصلاحية" },
    "Upcoming": { en: "Upcoming", ar: "القادمة" },
    "SSL certificate renewal": { en: "SSL certificate renewal", ar: "تجديد شهادة SSL" },

    // Workload
    "Track capacity across sprints, projects, and users.": { en: "Track capacity across sprints, projects, and users.", ar: "تتبع السعة عبر السبرنتات والمشاريع والمستخدمين." },
    "Select a project to view workload": { en: "Select a project to view workload", ar: "اختر مشروعاً لعرض عبء العمل" },
    "Select a user to view workload": { en: "Select a user to view workload", ar: "اختر مستخدماً لعرض عبء العمل" },
    "Avg Utilisation": { en: "Avg Utilisation", ar: "متوسط الاستخدام" },
    "Velocity": { en: "Velocity", ar: "السرعة" },
    "Variance": { en: "Variance", ar: "التباين" },
    "Overloaded Members": { en: "Overloaded Members", ar: "أعضاء مثقلو العمل" },

    // Meetings
    "Request a Meeting": { en: "Request a Meeting", ar: "طلب اجتماع" },
    "Schedule, vote on, and run meetings with your team.": { en: "Schedule, vote on, and run meetings with your team.", ar: "جدول الاجتماعات وصوّت عليها وأدرها مع فريقك." },
    "Attendees": { en: "Attendees", ar: "الحاضرون" },
    "Attendees are voting. Add more slots or close voting to confirm the winning time.": { en: "Attendees are voting. Add more slots or close voting to confirm the winning time.", ar: "الحاضرون يصوّتون. أضف مزيداً من المواعيد أو أغلق التصويت لتأكيد الوقت الفائز." },
    "Attendees vote on which slot they prefer. At least 1 slot required.": { en: "Attendees vote on which slot they prefer. At least 1 slot required.", ar: "يصوّت الحاضرون على الوقت المفضل. يلزم وجود موعد واحد على الأقل." },
    "Add another slot": { en: "Add another slot", ar: "إضافة موعد آخر" },
    "Close voting & confirm": { en: "Close voting & confirm", ar: "إغلاق التصويت والتأكيد" },
    "Room name or meeting link": { en: "Room name or meeting link", ar: "اسم الغرفة أو رابط الاجتماع" },
    "Voting": { en: "Voting", ar: "التصويت" },
    "You haven't responded to this meeting yet.": { en: "You haven't responded to this meeting yet.", ar: "لم تُجب على هذا الاجتماع بعد." },
    "Your response:": { en: "Your response:", ar: "ردك:" },
    "You": { en: "You", ar: "أنت" },
    "votes": { en: "votes", ar: "أصوات" },
    "Adjust filters or request a new meeting to get started.": { en: "Adjust filters or request a new meeting to get started.", ar: "عدّل المرشحات أو اطلب اجتماعاً جديداً للبدء." },
    "Search meetings…": { en: "Search meetings…", ar: "البحث في الاجتماعات..." },
    "Schedule, vote on, and run meetings": { en: "Schedule, vote on, and run meetings", ar: "جدول الاجتماعات وصوّت عليها وأدرها" },
    "Add agenda or notes...": { en: "Add agenda or notes...", ar: "أضف أجندة أو ملاحظات..." },
    "Your account details": { en: "Your account details", ar: "تفاصيل حسابك" },
    "Your response": { en: "Your response", ar: "ردك" },

    // Decisions
    "Add Decision": { en: "Add Decision", ar: "إضافة قرار" },
    "Submit Decision": { en: "Submit Decision", ar: "تقديم قرار" },
    "What is this decision about?": { en: "What is this decision about?", ar: "ما هذا القرار؟" },
    "Select a project first to manage criteria.": { en: "Select a project first to manage criteria.", ar: "اختر مشروعاً أولاً لإدارة المعايير." },
    "Select project first": { en: "Select project first", ar: "اختر المشروع أولاً" },
    "e.g. Adopt React Query for data fetching": { en: "e.g. Adopt React Query for data fetching", ar: "مثل: اعتماد React Query لجلب البيانات" },
    "e.g. Figma designs finalized and approved": { en: "e.g. Figma designs finalized and approved", ar: "مثل: اكتمال تصميمات Figma والموافقة عليها" },
    "Add new criteria": { en: "Add new criteria", ar: "إضافة معايير جديدة" },
    "Total Criteria": { en: "Total Criteria", ar: "إجمالي المعايير" },

    // Ownership / features
    "Create Feature": { en: "Create Feature", ar: "إنشاء ميزة" },
    "Search features…": { en: "Search features…", ar: "البحث في الميزات..." },
    "Select owner": { en: "Select owner", ar: "اختر المالك" },
    "Top Contributors": { en: "Top Contributors", ar: "أبرز المساهمين" },
    "Contributors": { en: "Contributors", ar: "المساهمون" },
    "authorship": { en: "authorship", ar: "نسب الأعمال" },
    "Total Items": { en: "Total Items", ar: "إجمالي العناصر" },

    // Misc
    "items": { en: "items", ar: "عنصر" },
    "issues": { en: "issues", ar: "مسائل" },
    "decisions": { en: "decisions", ar: "قرارات" },
    "delivery": { en: "delivery", ar: "تسليم" },
    "handoff": { en: "handoff", ar: "تسليم" },
    "overview": { en: "overview", ar: "نظرة عامة" },
    "friction": { en: "friction", ar: "احتكاك" },
    "workload": { en: "workload", ar: "عبء عمل" },
    "blockers": { en: "blockers", ar: "عائق" },
    "comments": { en: "comments", ar: "تعليق" },
    "complete": { en: "complete", ar: "مكتمل" },
    "total": { en: "total", ar: "الإجمالي" },
    "Total": { en: "Total", ar: "الإجمالي" },
    "To": { en: "To", ar: "إلى" },
    "T": { en: "T", ar: "م" },
    "TBD": { en: "TBD", ar: "سيُحدَّد" },
    "TODAY": { en: "TODAY", ar: "اليوم" },
    "Name": { en: "Name", ar: "الاسم" },
    "Cancelled": { en: "Cancelled", ar: "ملغى" },
    "API Service": { en: "API Service", ar: "خدمة API" },
    "Current breakdown": { en: "Current breakdown", ar: "التفاصيل الحالية" },
    "Custom days…": { en: "Custom days…", ar: "أيام مخصصة..." },
    "days ago": { en: "days ago", ar: "أيام مضت" },
    "days left": { en: "days left", ar: "أيام متبقية" },
    "Tag name": { en: "Tag name", ar: "اسم الوسم" },
    "Search users...": { en: "Search users...", ar: "البحث عن المستخدمين..." },
    "Search assignees...": { en: "Search assignees...", ar: "البحث عن المسؤولين..." },
    "You're offline. Some features may not be available.": { en: "You're offline. Some features may not be available.", ar: "أنت غير متصل. بعض الميزات قد لا تكون متاحة." },
    "A network error occurred. Please check your connection.": { en: "A network error occurred. Please check your connection.", ar: "حدث خطأ في الشبكة. يرجى التحقق من اتصالك." },
    "Retry": { en: "Retry", ar: "إعادة المحاولة" },
    "Sprint 12": { en: "Sprint 12", ar: "السبرنت 12" },
    "Select task": { en: "Select task", ar: "اختر مهمة" },
    "Select team": { en: "Select team", ar: "اختر فريقاً" },
    "Select type": { en: "Select type", ar: "اختر النوع" },
    "Select user": { en: "Select user", ar: "اختر مستخدماً" },
    "Select priority": { en: "Select priority", ar: "اختر الأولوية" },
    "Team (optional)": { en: "Team (optional)", ar: "الفريق (اختياري)" },
    "Tasks Done": { en: "Tasks Done", ar: "المهام المنجزة" },
    "Offline": { en: "Offline", ar: "غير متصل" },
    "Pick date & time": { en: "Pick date & time", ar: "اختر التاريخ والوقت" },
    "No data available": { en: "No data available", ar: "لا توجد بيانات" },
    "No active sprints": { en: "No active sprints", ar: "لا توجد سبرنتات نشطة" },
    "Pick a project first": { en: "Pick a project first", ar: "اختر مشروعاً أولاً" },
};

export const t = (key: string): string => {
    const lang = getSettings().language;
    return translations[key]?.[lang] ?? key;
};
