import { UserRole } from "@/enums";
import type { UserInterface } from "@/interfaces";

export const seedTeamMembers: UserInterface[] = [
    { id: "usr-001", full_name: "Mohamed Elhawary", email: "admin@twindix.com", role_tier: UserRole.SeniorFrontendEngineer, role_label: "", avatar_initials: "ME", team: "Frontend" },
    { id: "usr-002", full_name: "Basel Sherif", email: "basel@twindix.com", role_tier: UserRole.FrontendEngineer, role_label: "", avatar_initials: "BS", team: "Frontend" },
    { id: "usr-003", full_name: "Ahmed Heikal", email: "heikal@twindix.com", role_tier: UserRole.SeniorBackendEngineer, role_label: "", avatar_initials: "AH", team: "Backend" },
    { id: "usr-004", full_name: "Ahmed Bashier", email: "bashier@twindix.com", role_tier: UserRole.SeniorBackendEngineer, role_label: "", avatar_initials: "AB", team: "Backend" },
    { id: "usr-005", full_name: "Hazem Hassanien", email: "hazem@twindix.com", role_tier: UserRole.CTO, role_label: "", avatar_initials: "HH", team: "Leadership" },
    { id: "usr-006", full_name: "Mohamed Ismail", email: "ismail@twindix.com", role_tier: UserRole.CEO, role_label: "", avatar_initials: "MI", team: "Leadership" },
    { id: "usr-007", full_name: "Sarah Elseadawy", email: "sarah@twindix.com", role_tier: UserRole.HRManager, role_label: "", avatar_initials: "SE", team: "HR" },
    { id: "usr-008", full_name: "Karim Sayed", email: "karim@twindix.com", role_tier: UserRole.ProjectManager, role_label: "", avatar_initials: "KS", team: "Product" },
    { id: "usr-009", full_name: "Rashad Abdallah", email: "rashad@twindix.com", role_tier: UserRole.QualityControl, role_label: "", avatar_initials: "RA", team: "QA" },
    { id: "usr-010", full_name: "Ahmed Eldairy", email: "eldairy@twindix.com", role_tier: UserRole.AIEngineer, role_label: "", avatar_initials: "AE", team: "AI" },
    { id: "usr-011", full_name: "Walaa Sherif", email: "walaa@twindix.com", role_tier: UserRole.DataAnalyst, role_label: "", avatar_initials: "WS", team: "Data" },
    { id: "usr-012", full_name: "Mohamed Ahmed", email: "moahmed@twindix.com", role_tier: UserRole.UIUXDesigner, role_label: "", avatar_initials: "MA", team: "Design" },
];
