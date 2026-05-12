"use client";

import { ResponsiveModal } from "@/components/responsive-model";
import { RiskForm } from "./risk-form";
import { useCreateRiskModal, useEditRiskModal } from "../hooks/use-risk-modals";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const CreateRiskModal = ({ projectId, workspaceId }: { projectId: string, workspaceId: string }) => {
  const { isOpen, setIsOpen, close } = useCreateRiskModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full border-none shadow-none">
        <CardHeader><CardTitle>Log New Risk</CardTitle></CardHeader>
        <CardContent><RiskForm projectId={projectId} workspaceId={workspaceId} onCancel={close} /></CardContent>
      </Card>
    </ResponsiveModal>
  );
};

export const EditRiskModal = ({ projectId, workspaceId, risks }: { projectId: string, workspaceId: string, risks: any[] }) => {
  const { riskId, setRiskId, close } = useEditRiskModal();
  const riskToEdit = risks?.find((r) => r.id === riskId);

  return (
    <ResponsiveModal open={!!riskId} onOpenChange={(open) => !open && close()}>
      <Card className="w-full border-none shadow-none">
        <CardHeader><CardTitle>Edit Risk</CardTitle></CardHeader>
        <CardContent>
          {riskToEdit ? (
            <RiskForm projectId={projectId} workspaceId={workspaceId} initialValues={riskToEdit} onCancel={close} />
          ) : (
            <p className="text-muted-foreground text-center py-4">Risk not found.</p>
          )}
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};