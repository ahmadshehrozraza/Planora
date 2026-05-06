export enum SprintStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    OVER_DUE = "OVER_DUE"
}

export type Sprint = {
    id: string;
    projectId: string;
    name: string;
    goal: string | null;         
    description: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;  
    status: SprintStatus;
    createdAt: Date;
    updatedAt: Date;
};