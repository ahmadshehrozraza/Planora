export enum MemberRole {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    PROJECT_MANAGER = "PROJECT_MANAGER"
}

export type WorkspaceMemberData = {
    id: string;
    userId: string;
    workspaceId: string;
    name: string;
    email: string;
    imageUrl: string | null;
    role: MemberRole;
    createdAt: Date;
}