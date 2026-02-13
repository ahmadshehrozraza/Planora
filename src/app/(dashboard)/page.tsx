
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

export default async function WorkspacesPage() {
    const workspaces = await getWorkspaces();

    if (workspaces.total === 0) {
        redirect("/workspaces/create");
    }

    else if(workspaces.lastWorkspaceId){
      redirect(`/workspaces/${workspaces.lastWorkspaceId}`);
    }
    else{
      redirect(`/workspaces/${workspaces.documents[0].$id}`);
    }

}