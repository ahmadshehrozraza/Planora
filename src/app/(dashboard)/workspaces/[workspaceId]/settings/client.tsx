"use client";

import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetDummyWorkspace } from "@/features/workspaces/api/use-get-dummy-workspaces";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";


const WorkspaceIdSettingsClient = () => {

    const workspaceId = useWorkspaceId();

    const { data: initialValues, isLoading } = useGetDummyWorkspace( workspaceId );

    if(isLoading){
        return <PageLoader />
    }

    if(!initialValues){
        return <PageError message="No workspace found" />
    }

    return ( 
        
        <div className="w-full lg:max-w-xl">
            <EditWorkspaceForm initialValues={initialValues} 
            />
        </div>
     );
}
 
export default WorkspaceIdSettingsClient;