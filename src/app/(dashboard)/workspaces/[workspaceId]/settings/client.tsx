"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Settings2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { WorkspaceRolesManager } from "@/features/custom-roles/components/workspace-roles";
import { WorkspaceDelete } from "@/features/workspaces/components/delete-workspace";

interface WorkspaceSettingsClientProps {
  workspaceId: string;
}

export const WorkspaceSettingsClient = ({ workspaceId }: WorkspaceSettingsClientProps) => {

  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return <PageLoader />
  }

  if (!initialValues) {
    return <PageError message="Workspace not found or you don't have access." />;
  }

  return (
    <div className="w-full px-4 lg:px-6 flex flex-col gap-y-6 pb-10 mt-4">
      <div className="border-b pb-4 mb-2 w-full">
          <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="size-6" /> Workspace Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage workspace details, access controls, and administrative settings in one place.</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="general" className="border rounded-lg bg-card px-4 shadow-sm mb-4 w-full">
          <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4 w-full text-left">
            General Details
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 border-t w-full">
            <div className="mt-4 w-full block">
              <EditWorkspaceForm initialValues={initialValues} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="roles" className="border rounded-lg bg-card px-4 shadow-sm mb-4 w-full">
          <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4 w-full text-left">
            Roles & Permissions
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 border-t w-full">
            <div className="mt-4 w-full block">
              <WorkspaceRolesManager /> 
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="danger" className="border border-destructive/20 rounded-lg bg-destructive/5 px-4 shadow-sm mb-4 w-full">
          <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4 text-destructive w-full text-left">
            Danger Zone
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 border-t border-destructive/20 w-full">
            <div className="mt-4 w-full block">
              <WorkspaceDelete workspaceId={workspaceId} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};