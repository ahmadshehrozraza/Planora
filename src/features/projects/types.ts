
export enum ProjectStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    OVER_DUE = "OVER_DUE"
}

export type Project = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    inviteCode: string;
    
    status: ProjectStatus;
    currency: string;
    budget: number;
    
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    
    workspaceId: string;
    
    createdAt: Date;
    updatedAt: Date;
};