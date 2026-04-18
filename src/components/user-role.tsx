"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Crown, User } from "lucide-react";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { Skeleton } from "@/components/ui/skeleton";

export const UserRole = () => {
    const workspaceId = useWorkspaceId();
    const { data: permissions, isLoading } = useGetPermissions(workspaceId);
    
    if (isLoading) {
        
        return <Skeleton className="h-8 w-24 rounded-full" />;
    }

    const isWorkspaceAdmin = permissions?.workspaceAdmin ?? false;

    return(
        <div className={`hidden md:inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
          isWorkspaceAdmin
            ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30"
            : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
        }`}>
          {isWorkspaceAdmin ? (
            <>
              <Crown className="size-4" />
              <span className="font-semibold">Admin</span>
            </>
          ) : (
            <>
              <User className="size-4" />
              <span className="font-semibold">Member</span>
            </>
          )}
        </div>
    )
}

export default UserRole;