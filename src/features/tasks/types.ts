export enum TaskType {
    FEATURE = "FEATURE",
    TASK = "TASK",
    BUG = "BUG",
    SPIKE = "SPIKE",
    DOCS = "DOCS"
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}

export enum ColumnCategory {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}

export type CustomColumnData = {
    id: string;
    name: string;
    position: number;
    projectId: string;
    category?: ColumnCategory;
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
    taskType: TaskType;
    priority: TaskPriority;
    effortPoints: number;
    blockedBy?: Partial<Task>[];
    blocking?: Partial<Task>[];
    tags?: TagData[];
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    position: number;
}