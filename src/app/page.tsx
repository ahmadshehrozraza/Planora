import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { getPrefWorkspace } from "@/features/workspaces/hooks/get-pref-workspace";
import LandingPage from "@/features/landing/components/landing-page";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div>
        <LandingPage />
      </div>
    );
  }

  const workspaceId = await getPrefWorkspace();

  if (workspaceId) {
    redirect(`/workspaces/${workspaceId}`);
  } else {
    redirect("/workspaces/create"); 
  }
}