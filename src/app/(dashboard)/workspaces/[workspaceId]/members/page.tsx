
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MembersClient } from "./client";


const WorkspaceMembersPage = async () => {

    return ( 
        <div className="flex flex-col">
            <Navbar title="Workspace Members" description="Manage & view all your workspace members here" />
            <MembersClient />
        </div>
     );
}
 
export default WorkspaceMembersPage;