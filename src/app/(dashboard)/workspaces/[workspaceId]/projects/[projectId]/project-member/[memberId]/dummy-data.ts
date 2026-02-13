import { MemberRole } from "@/features/members/types";
import { SegmentStatus } from "@/features/segments/types";
import { TaskStatus, TaskType, TaskPriority } from "@/features/tasks/types";



interface MemberTask {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  effortPoints: number; // Points assigned to this task
  earnedPoints: number; // Points earned (if completed)
  budget: number;
  startDate: Date;
  endDate: Date;
  progress: number; // 0 to 100
}

interface MemberSegmentContribution {
  segmentId: string;
  segmentName: string;
  segmentStatus: SegmentStatus;
  segmentProgress: number; // Overall segment progress

  // Specific to this member in this segment
  memberTasksTotal: number;
  memberTasksCompleted: number;
  memberPointsAssigned: number;
  memberPointsEarned: number;
  tasks: MemberTask[];
}

interface ComprehensiveMemberProfile {
  // Identity
  meta: {
    id: string;
    userId: string;
    projectId: string;
    role: MemberRole;
    joinedDate: Date;
    status: "Active" | "Inactive";
  };

  // High Level KPIs (Dashboard Header)
  stats: {
    totalEffortPointsEarned: number; // Lifetime or Project Total
    currentProjectPoints: {          // Specific to visible tasks below
      totalAssigned: number;
      completed: number;
      percentage: number;
    };
    efficiencyScore: number;
    tasksCompletedCount: number;
    totalTasksAssigned: number;
    avgCompletionTimeDays: number;
  };

  // Workload Status
  currentWork: {
    workloadLabel: "Low" | "Moderate" | "High" | "Overloaded";
    activeSegmentName: string;
    activeTaskName: string | null;
    nextDeadline: Date;
  };


  segments: MemberSegmentContribution[];
}



export const memberFullProfile: ComprehensiveMemberProfile = {
  // 1. Meta Information
  meta: {
    id: 'member_001',
    userId: 'user_001',
    projectId: 'project_001',
    role: MemberRole.ADMIN,
    joinedDate: new Date('2024-01-05'),
    status: "Active"
  },

  // 2. Statistics & Points Calculation
  stats: {
    totalEffortPointsEarned: 345, // Historical/Lifetime points
    currentProjectPoints: {
      totalAssigned: 12,
      completed: 12,     // Sum of points of DONE tasks
      percentage: 100    // (12/12)*100
    },
    efficiencyScore: 95,
    tasksCompletedCount: 3,
    totalTasksAssigned: 3,
    avgCompletionTimeDays: 5
  },

  // 3. Current Focus
  currentWork: {
    workloadLabel: 'Moderate',
    activeSegmentName: 'Frontend Development',
    activeTaskName: 'Header Component Development',
    nextDeadline: new Date('2024-04-15')
  },

  // 4. Segment-Wise Breakdown (Member's specific contribution)
  segments: [
    {
      segmentId: 'segment_001',
      segmentName: 'UI/UX Design',
      segmentStatus: SegmentStatus.COMPLETED,
      segmentProgress: 100, // Overall Segment Progress

      // Member Stats for this Segment
      memberTasksTotal: 2,
      memberTasksCompleted: 2,
      memberPointsAssigned: 8, // 5 + 3
      memberPointsEarned: 8,

      tasks: [
        {
          id: 'task_001',
          name: 'Homepage Wireframe Design',
          description: 'Create wireframe for homepage layout with user flow',
          status: TaskStatus.DONE,
          priority: TaskPriority.HIGH,
          type: TaskType.TASK,
          effortPoints: 5,
          earnedPoints: 5,
          budget: 5000,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-20'),
          progress: 100
        },
        {
          id: 'task_004',
          name: 'Design System Documentation',
          description: 'Document design system components and guidelines',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
          type: TaskType.DOCUMENTATION,
          effortPoints: 3,
          earnedPoints: 3,
          budget: 2000,
          startDate: new Date('2024-01-25'),
          endDate: new Date('2024-01-28'),
          progress: 100
        }
      ]
    },
    {
      segmentId: 'segment_002',
      segmentName: 'Frontend Development',
      segmentStatus: SegmentStatus.ACTIVE,
      segmentProgress: 85, // Overall Segment Progress

      // Member Stats for this Segment
      memberTasksTotal: 1,
      memberTasksCompleted: 1,
      memberPointsAssigned: 4,
      memberPointsEarned: 4,

      tasks: [
        {
          id: 'task_005',
          name: 'Header Component Development',
          description: 'Build responsive header with navigation using React',
          status: TaskStatus.DONE,
          priority: TaskPriority.HIGH,
          type: TaskType.TASK,
          effortPoints: 4,
          earnedPoints: 4,
          budget: 4500,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-05'),
          progress: 100
        }
      ]
    },
    {
      segmentId: 'segment_003',
      segmentName: 'Backend Integration',
      segmentStatus: SegmentStatus.ACTIVE,
      segmentProgress: 30, // Overall Segment Progress

      // Member Stats for this Segment (No tasks yet)
      memberTasksTotal: 0,
      memberTasksCompleted: 0,
      memberPointsAssigned: 0,
      memberPointsEarned: 0,

      tasks: []
    }
  ]
};

export default memberFullProfile;