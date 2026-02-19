import { redirect } from "next/navigation";
import { getWorkspaces } from "@/features/workspaces/server/useGetWorkspace";

export default async function Home() {
  const workspacesData = await getWorkspaces();

  if (workspacesData.documents.length === 0) {
    redirect("/workspaces/create");
  } else {
    redirect(`/workspaces/${workspacesData.documents[0].id}`);
  }
}