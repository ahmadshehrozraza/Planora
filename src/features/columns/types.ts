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
    category: ColumnCategory;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateColumnPayload = {
    projectId: string;
    workspaceId: string;
    name: string;
    category: ColumnCategory;
}

export type UpdateColumnPayload = {
    columnId: string;
    projectId: string;
    name: string;
    category?: ColumnCategory;
}

export type ReorderColumnPayload = {
    id: string;
    position: number;
}