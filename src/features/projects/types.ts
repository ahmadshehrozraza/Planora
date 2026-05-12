export enum ProjectStatus {
    PLANNED = "PLANNED",
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
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
    
    estimatedKloc: number | null;
    calculatedEffort: number | null;
    calculatedCost: number | null;
    
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    
    workspaceId: string;
    
    createdAt: Date;
    updatedAt: Date;
};