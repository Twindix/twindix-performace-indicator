import type { ProjectCountsInterface, ProjectInterface } from "@/interfaces";

export const getProjectCounts = (project: ProjectInterface): ProjectCountsInterface => ({
    sprintCount: project.sprint_count ?? project.sprints_count ?? 0,
    memberCount: project.member_count ?? project.members_count ?? 0,
});
