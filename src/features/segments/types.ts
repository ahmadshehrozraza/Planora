

export type DummySegment =  {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startingDate: Date;
  endingDate: Date;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  segmentStatus: SegmentStatus;
  members: string[]; 
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};


export enum SegmentStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    OVER_DUE = "OVER_DUE"
};