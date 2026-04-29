import type { TeamDetailResponseInterface, TeamInterface } from "@/interfaces";

export const unwrapTeam = (res: TeamDetailResponseInterface | TeamInterface | unknown): TeamInterface | null => {
    if (!res || typeof res !== "object") return null;
    if ("data" in (res as object) && (res as TeamDetailResponseInterface).data) return (res as TeamDetailResponseInterface).data;
    if ("id" in (res as object)) return res as TeamInterface;
    return null;
};
