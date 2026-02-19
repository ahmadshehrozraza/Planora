
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";

import { DashboardLayoutWrapper } from "@/features/dashboard/components/dashboard-layout-wrapper";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <>
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />

      {/* Wrapper Client Component hai, lekin 'children' (jo pages hain) 
         wo Server Components hi rahenge! 
      */}
      <DashboardLayoutWrapper>
        {children}
      </DashboardLayoutWrapper>
    </>
  );
};

export default DashboardLayout;