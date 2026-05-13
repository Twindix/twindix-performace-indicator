import type { DeployEnvironment, DeployStatus } from "@/enums";

export interface DeployUploaderInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
    role_label?: string | null;
}

export interface DeployInterface {
    id: string;
    title: string;
    version: string | null;
    file_name: string;
    file_size: number; // bytes
    file_type: string; // mime / extension
    changes: string[];
    environment: DeployEnvironment;
    status: DeployStatus;
    uploaded_by: DeployUploaderInterface;
    uploaded_at: string; // ISO
    /** Blob URL — present only for items created this session. */
    download_url?: string | null;
}

export interface UploadDeployPayloadInterface {
    title: string;
    version?: string | null;
    file: File;
    changes: string[];
    environment: DeployEnvironment;
}
