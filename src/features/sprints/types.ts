export enum SprintStatus {
    PLANNED = "PLANNED",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED"
}

export type Sprint = {
    id: string;
    projectId: string;
    name: string;
    goal: string | null;         
    description: string | null;
    sprintNumber: number;
    capacityPoints: number | null;
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;  
    status: SprintStatus;
    createdAt: Date;
    updatedAt: Date;
};