import { dummyMembers } from "../hooks/dummy-members";
import { Member, MemberRole } from "@/features/members/types";

// Check if user has access to workspace
export const hasWorkspaceAccess = (userId: string, workspaceId: string): boolean => {
  return dummyMembers.some(
    m => m.memberId === userId && 
         m.workspaceId === workspaceId && 
         m.hasAccess
  );
};

// Get user role in workspace
export const getUserWorkspaceRole = (userId: string, workspaceId: string): MemberRole | null => {
  const membership = dummyMembers.find(
    m => m.memberId === userId && 
         m.workspaceId === workspaceId && 
         m.hasAccess
  );
  return membership ? membership.role : null;
};

// Get all projects user has access to
export const getUserProjects = (userId: string): string[] => {
  const projectMemberships = dummyMembers.filter(
    m => m.memberId === userId && 
         m.projectId && 
         m.hasAccess
  );
  return [...new Set(projectMemberships.map(m => m.projectId!))];
};

// Check if user is admin in any workspace
export const isUserAdmin = (userId: string): boolean => {
  return dummyMembers.some(
    m => m.memberId === userId && 
         m.role === MemberRole.ADMIN && 
         m.hasAccess
  );
};

// Get workspace admins
export const getWorkspaceAdmins = (workspaceId: string): string[] => {
  return dummyMembers
    .filter(m => 
      m.workspaceId === workspaceId && 
      m.role === MemberRole.ADMIN && 
      m.hasAccess
    )
    .map(m => m.memberId);
};

// Get project managers for a project
export const getProjectManagers = (projectId: string): string[] => {
  return dummyMembers
    .filter(m => 
      m.projectId === projectId && 
      m.role === MemberRole.PROJECT_MANAGER && 
      m.hasAccess
    )
    .map(m => m.memberId);
};

// Get all members for project (including workspace members with access)
export const getProjectTeamMembers = (projectId: string, workspaceId: string): string[] => {
  // Get project-specific members
  const projectSpecificMembers = dummyMembers
    .filter(m => m.projectId === projectId && m.hasAccess)
    .map(m => m.memberId);
  
  // Get workspace members who don't have project-specific membership but have workspace access
  const workspaceMembers = dummyMembers
    .filter(m => 
      m.workspaceId === workspaceId && 
      !m.projectId && 
      m.hasAccess
    )
    .map(m => m.memberId);
  
  return [...new Set([...projectSpecificMembers, ...workspaceMembers])];
};