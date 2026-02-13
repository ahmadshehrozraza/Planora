import { MemberRole } from "@/features/members/types";
import { SegmentStatus } from "@/features/segments/types";
import { TaskStatus, TaskType, TaskPriority } from "@/features/tasks/types";
import { ProjectStatus } from "@/features/projects/types";

// --- Raw Data Arrays (From your prompt) ---

const rawProjects = [
  {
    id: 'project_001',
    workspaceId: 'workspace_001',
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX and improved performance',
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-06-30'),
    projectStatus: ProjectStatus.ACTIVE,
    progress: 65,
    budget: 50000,
    totalTasks: 45,
    members: 8
  }
];

const rawSegments = [
  { id: 'segment_001', projectId: 'project_001', name: 'UI/UX Design', progress: 100, segmentStatus: SegmentStatus.COMPLETED },
  { id: 'segment_002', projectId: 'project_001', name: 'Frontend Development', progress: 85, segmentStatus: SegmentStatus.ACTIVE },
  { id: 'segment_003', projectId: 'project_001', name: 'Backend Integration', progress: 30, segmentStatus: SegmentStatus.ACTIVE },
];

const rawTasks = [
  { id: 'task_001', projectId: 'project_001', segmentId: 'segment_001', name: 'Homepage Wireframe', budget: 5000, effortPoints: 5, taskStatus: TaskStatus.DONE, taskPriority: TaskPriority.HIGH, assigneeId: 'user_001' },
  { id: 'task_002', projectId: 'project_001', segmentId: 'segment_001', name: 'Product Page Design', budget: 8000, effortPoints: 8, taskStatus: TaskStatus.DONE, taskPriority: TaskPriority.MEDIUM, assigneeId: 'user_002' },
  { id: 'task_003', projectId: 'project_001', segmentId: 'segment_001', name: 'Mobile Responsive', budget: 12000, effortPoints: 10, taskStatus: TaskStatus.DONE, taskPriority: TaskPriority.HIGH, assigneeId: 'user_006' },
  { id: 'task_004', projectId: 'project_001', segmentId: 'segment_001', name: 'Design System Doc', budget: 2000, effortPoints: 3, taskStatus: TaskStatus.DONE, taskPriority: TaskPriority.LOW, assigneeId: 'user_001' },
  { id: 'task_005', projectId: 'project_001', segmentId: 'segment_002', name: 'Header Component', budget: 4500, effortPoints: 4, taskStatus: TaskStatus.DONE, taskPriority: TaskPriority.HIGH, assigneeId: 'user_002' },
  { id: 'task_006', projectId: 'project_001', segmentId: 'segment_002', name: 'Homepage Impl', budget: 15000, effortPoints: 9, taskStatus: TaskStatus.IN_PROGRESS, taskPriority: TaskPriority.HIGH, assigneeId: 'user_007' },
  { id: 'task_007', projectId: 'project_001', segmentId: 'segment_002', name: 'Product Grid', budget: 8000, effortPoints: 6, taskStatus: TaskStatus.IN_PROGRESS, taskPriority: TaskPriority.MEDIUM, assigneeId: 'user_008' },
  { id: 'task_008', projectId: 'project_001', segmentId: 'segment_002', name: 'Footer Component', budget: 3500, effortPoints: 2, taskStatus: TaskStatus.BACKLOG, taskPriority: TaskPriority.LOW, assigneeId: 'user_008' },
  { id: 'task_009', projectId: 'project_001', segmentId: 'segment_003', name: 'API Endpoints', budget: 10000, effortPoints: 7, taskStatus: TaskStatus.IN_PROGRESS, taskPriority: TaskPriority.HIGH, assigneeId: 'user_003' },
];

const rawMembers = [
  { memberId: 'user_001', role: MemberRole.ADMIN, totalEffortPoints: 345 },
  { memberId: 'user_002', role: MemberRole.PROJECT_MANAGER, totalEffortPoints: 289 },
  { memberId: 'user_003', role: MemberRole.PROJECT_MANAGER, totalEffortPoints: 456 },
  { memberId: 'user_004', role: MemberRole.MEMBER, totalEffortPoints: 187 },
  { memberId: 'user_005', role: MemberRole.MEMBER, totalEffortPoints: 143 },
  { memberId: 'user_006', role: MemberRole.MEMBER, totalEffortPoints: 312 },
  { memberId: 'user_007', role: MemberRole.MEMBER, totalEffortPoints: 198 },
  { memberId: 'user_008', role: MemberRole.MEMBER, totalEffortPoints: 245 },
];

// --- Merge Logic ---

export const getProjectAnalyticsData = (projectId: string) => {
  const project = rawProjects.find(p => p.id === projectId);
  if (!project) return null;

  const segments = rawSegments.filter(s => s.projectId === projectId);
  const tasks = rawTasks.filter(t => t.projectId === projectId);
  
  // Calculate Totals
  const totalBudgetUsed = tasks.reduce((sum, t) => sum + t.budget, 0);
  const totalEffortPoints = tasks.reduce((sum, t) => sum + t.effortPoints, 0);
  const completedEffortPoints = tasks
    .filter(t => t.taskStatus === TaskStatus.DONE)
    .reduce((sum, t) => sum + t.effortPoints, 0);

  // Status Distribution for Charts
  const statusDistribution = [
    { name: 'Done', value: tasks.filter(t => t.taskStatus === TaskStatus.DONE).length, fill: '#10b981' }, // emerald-500
    { name: 'In Progress', value: tasks.filter(t => t.taskStatus === TaskStatus.IN_PROGRESS).length, fill: '#3b82f6' }, // blue-500
    { name: 'Backlog', value: tasks.filter(t => t.taskStatus === TaskStatus.BACKLOG).length, fill: '#64748b' }, // slate-500
  ];

  // Enrich Members with specific project contribution
  const enrichedMembers = rawMembers.map(m => {
    const memberTasks = tasks.filter(t => t.assigneeId === m.memberId);
    const pointsAssigned = memberTasks.reduce((sum, t) => sum + t.effortPoints, 0);
    const tasksCompleted = memberTasks.filter(t => t.taskStatus === TaskStatus.DONE).length;
    
    return {
      ...m,
      projectTasks: memberTasks.length,
      projectPoints: pointsAssigned,
      projectTasksCompleted: tasksCompleted,
      efficiency: memberTasks.length > 0 ? Math.round((tasksCompleted / memberTasks.length) * 100) : 0
    };
  }).filter(m => m.projectTasks > 0); // Only show members active in this project

  // Enrich Segments with task details
  const enrichedSegments = segments.map(s => {
    const segmentTasks = tasks.filter(t => t.segmentId === s.id);
    const segmentBudget = segmentTasks.reduce((sum, t) => sum + t.budget, 0);
    return {
      ...s,
      taskCount: segmentTasks.length,
      budgetUsed: segmentBudget
    };
  });

  return {
    meta: project,
    kpi: {
      budgetUsed: totalBudgetUsed,
      budgetRemaining: project.budget - totalBudgetUsed,
      budgetUtilization: Math.round((totalBudgetUsed / project.budget) * 100),
      effortProgress: Math.round((completedEffortPoints / totalEffortPoints) * 100),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.taskStatus === TaskStatus.DONE).length
    },
    charts: {
      statusDistribution
    },
    segments: enrichedSegments,
    members: enrichedMembers,
    tasks: tasks
  };
};