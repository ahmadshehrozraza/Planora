import { PageLoader } from "@/components/page-loader";

export default function WorkspaceSettingsLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <PageLoader />
    </div>
  );
}