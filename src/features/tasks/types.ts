
export enum TaskType {
    TASK = "TASK",
    FEATURE = "FEATURE",
    DOCUMENTATION = "DOCUMENTATION"
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

export type CustomColumnData = {
    id: string;
    name: string;
    position: number;
    projectId: string;
}

export type Task = {
    id: string;
    workspaceId: string;
    assignedById: string;
    projectId: string;
    segmentId: string | null;
    columnId: string;
    name: string;
    description: string | null;
    budget: number;
    startDate: Date | null;
    dueDate: Date | null;
    assigneeId: string | null;
    taskType: string;
    priority: string;
    effortPoints: number;
    blockedById: string | null;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    position: number;
}