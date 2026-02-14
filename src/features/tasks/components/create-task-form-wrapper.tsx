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
  const [projectOptions, setProjectOptions] = useState<{id: string, name: string, imageUrl: string}[]>([]);
  const [memberOptions, setMemberOptions] = useState<{id: string, name: string, userId: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<{userId: string, name: string}>({ userId: 'user_001', name: 'Ahmed Raza' });

  useEffect(() => {
    if (!workspaceId) {
      console.log("workspace id is null in create-task-form-wrapper");
      return;
    }

    // Simulate loading
    const timer =  out(() => {
      // Filter projects by workspace
      const filteredProjects = dummyProjects.filter(project => project.workspaceId === workspaceId);
      
      // Get project options
      const projects = filteredProjects.map(project => ({
        id: project.id,
        name: project.name,
        imageUrl: project.imageUrl || '',
      }));

      // Filter members by workspace
      const filteredMembers = dummyMembers.filter(member => 
        member.workspaceId === workspaceId && member.hasAccess
      );

      // Create member options with user names
      const members = filteredMembers.map(member => {
        const user = dummyUsers.find(u => u.userId === member.memberId);
        return {
          id: member.memberId,
          name: user?.name || `User ${member.memberId}`,
          userId: member.memberId,
        };
      });

      // Get current user
      const user = dummyUsers.find(u => u.userId === 'user_001');

      setProjectOptions(projects);
      setMemberOptions(members);
      if (user) {
        setCurrentUser({ userId: user.userId, name: user.name });
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [workspaceId]);

  if (!workspaceId) {
    return null;
  }

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
      projectOptions={projectOptions}
      memberOptions={memberOptions}
      currentUser={currentUser}
    />
  );
};