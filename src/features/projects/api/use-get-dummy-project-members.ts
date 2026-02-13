import { useQuery } from "@tanstack/react-query";
import { dummyMembers } from "../server/dummy-project-members";
import { Member, MemberRole } from "@/features/members/types";

interface UseGetProjectMembersOptions {
  workspaceId?: string;
  projectId?: string;
  role?: MemberRole;
  hasAccess?: boolean;
}

export const useGetProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const projectMembers = dummyMembers.filter(
        m => m.projectId === projectId
      );
      
      return {
        documents: projectMembers,
        total: projectMembers.length,
      };
    },
    enabled: !!projectId,
  });
};