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

export type TagData = {
    id: string;
    name: string;
    color: string;
}

export type Task = {
    id: string;
    workspaceId: string;
    assignedById: string;
    projectId: string;
    sprintId: string | null;
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
    blockedBy?: Partial<Task>[];
    blocking?: Partial<Task>[];
    tags?: TagData[];
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    position: number;
}