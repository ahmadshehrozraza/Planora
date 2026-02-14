import { useQuery } from "@tanstack/react-query";
import { dummyMembers } from "../hooks/dummy-members";
import { Member, MemberRole } from "@/features/members/types";

interface UseGetMembersOptions {
  workspaceId?: string;
  projectId?: string;
  role?: MemberRole;
  hasAccess?: boolean;
}

export const useGetMember = (memberId: string) => {
  return useQuery({
    queryKey: ["member", memberId],
    queryFn: async () => {

      
      const member = dummyMembers.find(m => m.id === memberId);
      
      if (!member) {
        throw new Error(`Member with ID ${memberId} not found`);
      }
      
      return member;
    },
    enabled: !!memberId,
  });
};

export const useGetMembers = (options?: UseGetMembersOptions) => {
  return useQuery({
    queryKey: ["members", options],
    queryFn: async () => {
      
      let filteredMembers = [...dummyMembers];
      
      // Apply filters
      if (options?.workspaceId) {
        filteredMembers = filteredMembers.filter(m => m.workspaceId === options.workspaceId);
      }
      
      if (options?.projectId) {
        filteredMembers = filteredMembers.filter(m => m.projectId === options.projectId);
      }
      
      if (options?.role) {
        filteredMembers = filteredMembers.filter(m => m.role === options.role);
      }
      
      if (options?.hasAccess !== undefined) {
        filteredMembers = filteredMembers.filter(m => m.hasAccess === options.hasAccess);
      }
      
      // Calculate statistics
      const roleCounts = {
        ADMIN: filteredMembers.filter(m => m.role === MemberRole.ADMIN).length,
        PROJECT_MANAGER: filteredMembers.filter(m => m.role === MemberRole.PROJECT_MANAGER).length,
        MEMBER: filteredMembers.filter(m => m.role === MemberRole.MEMBER).length,
      };
      
      const activeMembers = filteredMembers.filter(m => m.hasAccess).length;
      const inactiveMembers = filteredMembers.filter(m => !m.hasAccess).length;
      
      return {
        documents: filteredMembers,
        total: filteredMembers.length,
        activeMembers,
        inactiveMembers,
        roleCounts,
      };
    },
  });
};

export const useGetWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
       //
      
      const workspaceMembers = dummyMembers.filter(
        m => m.workspaceId === workspaceId
      );
      
      return {
        documents: workspaceMembers,
        total: workspaceMembers.length,
      };
    },
    enabled: !!workspaceId,
  });
};

export const useGetProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
       //
      
      const projectMembers = dummyMembers.filter(
        m => m.projectId === projectId && m.hasAccess
      );
      
      return {
        documents: projectMembers,
        total: projectMembers.length,
      };
    },
    enabled: !!projectId,
  });
};