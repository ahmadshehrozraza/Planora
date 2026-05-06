import { PERMISSIONS } from "@/lib/permissions-constants";

export const WORKSPACE_LEVEL_PERMISSIONS = [

  { value: PERMISSIONS.WORKSPACE_UPDATE, label: "Update Workspace Settings" },
  { value: PERMISSIONS.WORKSPACE_DELETE, label: "Delete Workspace (Danger)" },
  { value: PERMISSIONS.WORKSPACE_MANAGE_MEMBERS, label: "Manage Workspace Members" },
  { value: PERMISSIONS.WORKSPACE_MANAGE_ROLES, label: "Manage Global Roles" },
  { value: PERMISSIONS.WORKSPACE_VIEW_ALL_PROJECTS, label: "View All Projects (Admin)" },
  { value: PERMISSIONS.WORKSPACE_VIEW_ANALYTICS, label: "View Workspace Analytics" },
  { value: PERMISSIONS.WORKSPACE_EXPORT_DATA, label: "Export Workspace Data" },

  { value: PERMISSIONS.PROJECT_CREATE, label: "Create New Projects" },
  
];

export const PROJECT_LEVEL_PERMISSIONS = [
  { value: PERMISSIONS.PROJECT_VIEW, label: "View Project" },
  { value: PERMISSIONS.PROJECT_UPDATE, label: "Update Project Details" },
  { value: PERMISSIONS.PROJECT_DELETE, label: "Delete Project" },
  { value: PERMISSIONS.PROJECT_MANAGE_MEMBERS, label: "Manage Project Members" },
  { value: PERMISSIONS.PROJECT_MANAGE_ROLES, label: "Manage Project Roles" },
  { value: PERMISSIONS.PROJECT_VIEW_ANALYTICS, label: "View Project Analytics" },
  
  { value: PERMISSIONS.SPRINT_CREATE, label: "Create Sprints" },
  { value: PERMISSIONS.SPRINT_UPDATE, label: "Update Sprints" },
  { value: PERMISSIONS.SPRINT_DELETE, label: "Delete Sprints" },
  { value: PERMISSIONS.SPRINT_COMPLETE, label: "Complete Sprints" },

  { value: PERMISSIONS.TASK_CREATE, label: "Create Tasks" },
  { value: PERMISSIONS.TASK_UPDATE_FULL, label: "Full Edit Tasks" },
  { value: PERMISSIONS.TASK_UPDATE_STATUS, label: "Update Task Status Only" },
  { value: PERMISSIONS.TASK_ASSIGN, label: "Assign Tasks" },
  { value: PERMISSIONS.TASK_DELETE, label: "Delete Tasks" },

  { value: PERMISSIONS.EVENT_CREATE, label: "Create Events" },
  { value: PERMISSIONS.EVENT_UPDATE, label: "Update Events" },
  { value: PERMISSIONS.EVENT_DELETE, label: "Delete Events" },

  { value: PERMISSIONS.RISK_VIEW, label: "View Risks" },
  { value: PERMISSIONS.RISK_CREATE, label: "Create Risks" },
  { value: PERMISSIONS.RISK_UPDATE, label: "Update Risks" },
  { value: PERMISSIONS.RISK_DELETE, label: "Delete Risks" },

  { value: PERMISSIONS.COMMENT_CREATE, label: "Create Comments" },
  { value: PERMISSIONS.COMMENT_DELETE, label: "Delete Any Comment" },
  
  { value: PERMISSIONS.FILE_UPLOAD, label: "Upload Files" },
  { value: PERMISSIONS.FILE_DELETE, label: "Delete Any File" },
];