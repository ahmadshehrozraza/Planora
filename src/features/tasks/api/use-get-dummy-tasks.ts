import { useQuery } from "@tanstack/react-query";
import { dummyTasks } from "../server/dummyTasks";
import { TaskType, TaskStatus, TaskPriority } from "../types";

interface UseGetTasksOptions {
  workspaceId?: string;
  projectId?: string;
  segmentId?: string;
  status?: TaskStatus;
  assigneeId?: string;
  taskType?: string;
  priority?: string;
}

export const useGetTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const task = dummyTasks.find(t => t.id === taskId);
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      return task;
    },
  });
};

export const useGetTasks = (options?: UseGetTasksOptions) => {
  return useQuery({
    queryKey: ["tasks", options],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let filteredTasks = [...dummyTasks];
      
      // Apply filters
      if (options?.workspaceId) {
        filteredTasks = filteredTasks.filter(t => t.workspaceId === options.workspaceId);
      }
      
      if (options?.projectId) {
        filteredTasks = filteredTasks.filter(t => t.projectId === options.projectId);
      }
      
      if (options?.segmentId) {
        filteredTasks = filteredTasks.filter(t => t.segmentId === options.segmentId);
      }
      
      if (options?.status) {
        filteredTasks = filteredTasks.filter(t => t.taskStatus === options.status);
      }
      
      if (options?.assigneeId) {
        filteredTasks = filteredTasks.filter(t => t.assigneeId === options.assigneeId);
      }
      
      if (options?.taskType) {
        filteredTasks = filteredTasks.filter(t => t.taskType === options.taskType);
      }
      
      if (options?.priority) {
        filteredTasks = filteredTasks.filter(t => t.taskPriority === options.priority);
      }
      
      // Calculate statistics
      const totalEffort = filteredTasks.reduce((sum, task) => sum + task.effortPoints, 0);
      const completedEffort = filteredTasks
        .filter(t => t.taskStatus === TaskStatus.DONE)
        .reduce((sum, task) => sum + task.effortPoints, 0);
      
      const statusCounts = {
        BACKLOG: filteredTasks.filter(t => t.taskStatus === TaskStatus.BACKLOG).length,
        TODO: filteredTasks.filter(t => t.taskStatus === TaskStatus.TODO).length,
        IN_PROGRESS: filteredTasks.filter(t => t.taskStatus === TaskStatus.IN_PROGRESS).length,
        IN_REVIEW: filteredTasks.filter(t => t.taskStatus === TaskStatus.IN_REVIEW).length,
        DONE: filteredTasks.filter(t => t.taskStatus === TaskStatus.DONE).length,
      };
      
      return {
        documents: filteredTasks,
        total: filteredTasks.length,
        totalEffort,
        completedEffort,
        progressPercentage: totalEffort > 0 ? Math.round((completedEffort / totalEffort) * 100) : 0,
        statusCounts,
      };
    },
  });
};

export const useGetTasksByAssignee = (assigneeId: string) => {
  return useQuery({
    queryKey: ["tasks-by-assignee", assigneeId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const assignedTasks = dummyTasks.filter(t => t.assigneeId === assigneeId);
      
      return {
        documents: assignedTasks,
        total: assignedTasks.length,
      };
    },
    enabled: !!assigneeId,
  });
};

export const useGetTasksByProject = (projectId: string) => {
  return useQuery({
    queryKey: ["tasks-by-project", projectId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const projectTasks = dummyTasks.filter(t => t.projectId === projectId);
      
      return {
        documents: projectTasks,
        total: projectTasks.length,
      };
    },
    enabled: !!projectId,
  });
};

export const useGetTasksBySegment = (segmentId: string) => {
  return useQuery({
    queryKey: ["tasks-by-segment", segmentId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const segmentTasks = dummyTasks.filter(t => t.segmentId === segmentId);
      
      return {
        documents: segmentTasks,
        total: segmentTasks.length,
      };
    },
    enabled: !!segmentId,
  });
};