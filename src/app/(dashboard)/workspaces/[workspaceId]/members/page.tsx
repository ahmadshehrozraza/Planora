
import { redirect } from "next/navigation";
import { MembersList } from "@/features/workspaces/components/members-list";
import { Navbar } from "@/components/navbar";


const WorkspaceMembersPage = async () => {

    return ( 
        <div className="flex flex-col">
            <Navbar title="Workspace Members" description="Manage & view all your workspace members here" />
            <MembersList />
        </div>
     );
}
 
export default WorkspaceMembersPage;