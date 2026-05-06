"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";
import { PageLoader } from "@/components/page-loader";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({ onCancel, id }: EditTaskFormWrapperProps) => {
  
  const { data: taskData, isLoading: isLoadingTask } = useGetTask({ taskId: id });

  if (isLoadingTask) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <PageLoader />
        </CardContent>
      </Card>
    );
  }

  if (!taskData) return null;

  return (
    <EditTaskForm 
      initialValues={taskData}
      onCancel={onCancel}
    />
  );
};