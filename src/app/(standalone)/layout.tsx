"use client"

import { Navbar } from "@/components/navbar";
import { StandaloneNavbar } from "@/components/standaloneNavbar";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";

interface StandloneLayoutProps {
  children: React.ReactNode;
}

const StandloneLayout = ({ children }: StandloneLayoutProps) => {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />

      <div className="flex w-full h-full">


        <div className="w-full">
          <div className="mx-auto max-w-screen-2xl h-full">

            <StandaloneNavbar />

            <main className="h-full w-full flex justify-center items-center px-2 flex-col">
              {children}
            </main>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StandloneLayout;
