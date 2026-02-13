export enum MemberRole {
    ADMIN = "ADMIN",
    PROJECT_MANAGER = "PROJECT_MANAGER",
    MEMBER = "MEMBER"
};

export type Member = {
    id: string;
    memberId: string; 
    workspaceId: string;
    role: MemberRole;
    projectId?: string;
    hasAccess: boolean;
    joinedDate: Date;
    createdAt: Date;
    updatedAt: Date;
};