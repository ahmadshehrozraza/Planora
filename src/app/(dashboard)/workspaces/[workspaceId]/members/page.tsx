
import { Navbar } from "@/components/navbar";
import { WorkspaceMembersClient } from "./client";


const WorkspaceMembersPage = async () => {

    return ( 
        <div className="flex flex-col">
            <Navbar title="Workspace Members" description="Manage & view all your workspace members here" />
            <WorkspaceMembersClient />
        </div>
     );
}
 
export default WorkspaceMembersPage;