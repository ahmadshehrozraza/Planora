import { dummyWorkspaces } from "../dummy-workspaces";
import { DummyWorkspace } from "../types";

export async function getWorkspaces() {

  const workspaces: DummyWorkspace[] = dummyWorkspaces;

  return {
    documents: workspaces,
    total: workspaces.length,
    success: true
  };
}