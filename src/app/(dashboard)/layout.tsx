"use client";

import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
 
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";

interface DashboardLayoutProps {
    children: React.ReactNode;
};

const DashboardLayoutProps = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen">
            <CreateWorkspaceModal />
            <CreateProjectModal />
            <CreateTaskModal />
            <EditTaskModal />
            <div className="flex w-full h-full">
                <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
                    <Sidebar/>
                </div>
                <div className="lg:pl-[264px] w-full">
                    <div className="mx-auto max-w-screen-2xl h-full">
                        <Navbar />
                        <div className="h-full w-full flex items-center py-8 px-6 flex-col">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayoutProps;