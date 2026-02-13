"use client";

import { useCurrent } from "@/features/auth/api/use-current";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMember } from "../api/use-get-member";

export const useCurrentMember = () => {
  const { data: currentUser } = useCurrent();
  const workspaceId = useWorkspaceId();
  
  const { 
    data: member, 
    isLoading, 
    error,
    refetch 
  } = useGetMember({
    workspaceId: workspaceId!,
    userId: currentUser?.$id
  });

  return {
    member,
    role: member?.role,
    isAdmin: member?.role === "ADMIN",
    isMember: member?.role === "MEMBER",
    isLoading,
    error,
    refetch,
  };
};

// Usage in any component:
// import { useCurrentMember } from "@/features/members/hooks/use-current-member";

// const { member, role, isAdmin } = useCurrentMember();