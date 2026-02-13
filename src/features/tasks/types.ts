import { Models } from "node-appwrite";


export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
};

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string;
    assignedBy: string; 
    projectId: string;
    position: number;
    dueDate: string;
    description: string;
    taskType: TaskType;
    priority: TaskPriority;
}

export enum TaskType {
    TASK = "TASK",
    FEATURE = "FEATURE",
    DOCUMENTATION = "DOCUMENTATION"
};

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM", 
    HIGH = "HIGH",
};