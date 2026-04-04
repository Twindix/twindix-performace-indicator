import { UserRole } from "@/enums";
import type { UserInterface } from "@/interfaces";

export const seedTeamMembers: UserInterface[] = [
    { id: "usr-001", name: "Mohamed Elhawary", email: "admin@twindix.com", role: UserRole.SeniorFrontendEngineer, avatar: "ME", team: "Frontend" },
    { id: "usr-002", name: "Basel Sherif", email: "basel@twindix.com", role: UserRole.FrontendEngineer, avatar: "BS", team: "Frontend" },
    { id: "usr-003", name: "Ahmed Heikal", email: "heikal@twindix.com", role: UserRole.SeniorBackendEngineer, avatar: "AH", team: "Backend" },
    { id: "usr-004", name: "Ahmed Bashier", email: "bashier@twindix.com", role: UserRole.SeniorBackendEngineer, avatar: "AB", team: "Backend" },
    { id: "usr-005", name: "Hazem Hassanien", email: "hazem@twindix.com", role: UserRole.CTO, avatar: "HH", team: "Leadership" },
    { id: "usr-006", name: "Mohamed Ismail", email: "ismail@twindix.com", role: UserRole.CEO, avatar: "MI", team: "Leadership" },
    { id: "usr-007", name: "Sarah Elseadawy", email: "sarah@twindix.com", role: UserRole.HRManager, avatar: "SE", team: "HR" },
    { id: "usr-008", name: "Karim Sayed", email: "karim@twindix.com", role: UserRole.ProjectManager, avatar: "KS", team: "Product" },
    { id: "usr-009", name: "Rashad Abdallah", email: "rashad@twindix.com", role: UserRole.QualityControl, avatar: "RA", team: "QA" },
    { id: "usr-010", name: "Ahmed Eldairy", email: "eldairy@twindix.com", role: UserRole.AIEngineer, avatar: "AE", team: "AI" },
    { id: "usr-011", name: "Walaa Sherif", email: "walaa@twindix.com", role: UserRole.DataAnalyst, avatar: "WS", team: "Data" },
    { id: "usr-012", name: "Mohamed Ahmed", email: "moahmed@twindix.com", role: UserRole.UIUXDesigner, avatar: "MA", team: "Design" },
];
