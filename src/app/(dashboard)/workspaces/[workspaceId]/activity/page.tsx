import { Navbar } from "@/components/navbar";
import WorkspaceActivityClient from "./client";

export default function WorkspaceActivityPage() {

    return (
        <div className="flex flex-col">
            <Navbar title="Workspace Activity" description="Track all actions across projects and tasks in this workspace." />
            <WorkspaceActivityClient />
        </div>
    );
}