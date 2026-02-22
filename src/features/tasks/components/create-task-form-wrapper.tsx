"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";
import { dummyProjects } from "@/features/projects/dummyProjects";
import { dummyMembers } from "@/features/members/hooks/dummy-members";
import { dummyUsers } from "@/features/auth/server/dummy-users";
import { useState, useEffect } from "react";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateTaskFormWrapper = ({ onCancel }: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    projects: [] as { id: string; name: string; imageUrl: string }[],
    members: [] as { id: string; name: string; userId: string }[],
    user: { userId: 'user_001', name: 'Ahmed Raza' }
  });

  useEffect(() => {
    if (!workspaceId) return;

    const timer = setTimeout(() => {
      const filteredProjects = dummyProjects
        .filter(p => p.workspaceId === workspaceId)
        .map(p => ({ id: p.id, name: p.name, imageUrl: p.imageUrl || '' }));

      const filteredMembers = dummyMembers
        .filter(m => m.workspaceId === workspaceId && m.hasAccess)
        .map(m => {
          const user = dummyUsers.find(u => u.userId === m.memberId);
          return { id: m.memberId, name: user?.name || `User ${m.memberId}`, userId: m.memberId };
        });

      const user = dummyUsers.find(u => u.userId === 'user_001') || data.user;

      setData({ projects: filteredProjects, members: filteredMembers, user });
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [workspaceId]);

  if (!workspaceId) return null;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <CreateTaskForm 
      onCancel={onCancel}
      projectOptions={data.projects}
      memberOptions={data.members}
      currentUser={data.user}
    />
  );
};