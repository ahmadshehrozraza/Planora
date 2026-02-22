import { Navbar } from "@/components/navbar";
import { MemberProfileClient } from "./client";

export default function MemberProfilePage({ 
  params 
}: { 
  params: { workspaceId: string, memberId: string } 
}) {
  return (
    <div className="h-full w-full">
        <Navbar title="Workspace Member" description="Manage & view a member here" />
      <MemberProfileClient workspaceId={params.workspaceId} memberId={params.memberId} />
    </div>
  );
}