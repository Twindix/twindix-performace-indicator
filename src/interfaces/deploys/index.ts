import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";
import type { DeployEnvironment, DeployStatus } from "@/enums";

export interface DeployUploaderInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
    role_label?: string | null;
}

export interface DeployInterface {
    id: string;
    project_id?: string | null;
    title: string;
    version: string | null;
    file_name: string;
    file_size: number; // bytes
    file_type: string; // mime
    changes: string[];
    environment: DeployEnvironment;
    status: DeployStatus;
    uploaded_by: DeployUploaderInterface;
    uploaded_at: string; // ISO
    created_at?: string;
    updated_at?: string;
}

export interface UploadDeployPayloadInterface {
    title: string;
    version?: string | null;
    file: File;
    changes: string[];
    environment: DeployEnvironment;
    project_id?: string;
}

export interface UpdateDeployStatusPayloadInterface {
    status: DeployStatus;
}

export interface DeploysListFiltersInterface extends PaginationParamsInterface {
    environment?: DeployEnvironment;
    status?: DeployStatus;
    uploaded_by?: string;
    search?: string;
    project_id?: string;
}

export type DeploysListResponseInterface = PaginatedResponseInterface<DeployInterface>;
