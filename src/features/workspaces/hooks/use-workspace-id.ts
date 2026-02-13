
import { useParams } from "next/navigation";

export const useWorkspaceId = () => {
  const params = useParams();
  return typeof params.workspaceId === "string" ? params.workspaceId : undefined;
};
