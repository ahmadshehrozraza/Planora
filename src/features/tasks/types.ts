export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
};

export enum TaskType {
    TASK = "TASK",
    FEATURE = "FEATURE",
    DOCUMENTATION = "DOCUMENTATION"
};

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
};

export type Task = {
    id: string;
    workspaceId: string;
    assignedById: string;

    projectId: string;
    segmentId: string;
    name: string;
    description: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    assigneeId: string;
    taskStatus: TaskStatus;
    taskType: TaskType;
    taskPriority: TaskPriority;
    effortPoints: number;
    progress: number;
    blockedBy: string;
    blockingTo: string;

    currency: string;
    createdAt: Date;
    updatedAt: Date;
    position: number;
}