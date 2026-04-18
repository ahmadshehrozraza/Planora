export enum SegmentStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    OVER_DUE = "OVER_DUE"
}

export type Segment = {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    status: SegmentStatus;
    createdAt: Date;
    updatedAt: Date;
};