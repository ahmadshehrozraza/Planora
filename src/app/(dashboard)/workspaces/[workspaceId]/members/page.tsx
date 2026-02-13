
import { redirect } from "next/navigation";
import { MembersList } from "@/features/workspaces/components/members-list";


const WorkspaceIdMembersPage = async () => {

    return ( 
            <MembersList />
     );
}
 
export default WorkspaceIdMembersPage;