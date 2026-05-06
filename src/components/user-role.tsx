"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { Crown, ShieldCheck, User, Eye } from "lucide-react";
import { useCurrentRole } from "@/features/custom-roles/api/use-current-role";
import { Skeleton } from "@/components/ui/skeleton";

export const UserRole = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  
  const { data: roleData, isLoading } = useCurrentRole(workspaceId as string, projectId as string | null);
  
  if (isLoading) {
    return <Skeleton className="h-8 w-24 rounded-full hidden md:inline-flex" />;
  }

  if (!roleData) return null;

  const roleName = roleData.name;
  const permissionsList = roleData.permissions || [];


  const getBadgeStyle = () => {

    if (permissionsList.includes("WORKSPACE_DELETE") || permissionsList.includes("WORKSPACE_MANAGE_ROLES")) {
      return {
        Icon: Crown,
        colorClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30"
      };
    }

    if (permissionsList.includes("WORKSPACE_UPDATE") || permissionsList.includes("PROJECT_MANAGE_MEMBERS") || permissionsList.includes("WORKSPACE_MANAGE_MEMBERS")) {
      return {
        Icon: ShieldCheck,
        colorClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
      };
    }

    if (permissionsList.includes("TASK_UPDATE_FULL") || permissionsList.includes("PROJECT_CREATE") || permissionsList.includes("TASK_CREATE")) {
      return {
        Icon: User,
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
      };
    }

    return {
      Icon: Eye,
      colorClass: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30"
    };
  };

  const { Icon, colorClass } = getBadgeStyle();

  return(
    <div className={`hidden md:inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${colorClass}`}>
      <Icon className="size-4" />
      <span className="font-semibold">{roleName}</span>
    </div>
  );
};

export default UserRole;