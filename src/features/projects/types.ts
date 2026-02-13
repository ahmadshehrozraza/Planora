

import { Models } from "node-appwrite";

export type Project = Models.Document & {
    name: string;
    imageUrl: string;
    workspaceId: string;
};

export type DummyProject = {
    id: string;
    workspaceId: string;
    name: string;
    description: string;
    imageUrl: string | null;
    startDate: Date;
    dueDate: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    projectManagerId: string;
    projectStatus: ProjectStatus;
    progress: number;
    budget: number;
    totalTasks: number;
    totalSegments: number;
    completedTasks: number;
    members: number;
};

export enum ProjectStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    OVER_DUE = "OVER_DUE"
};