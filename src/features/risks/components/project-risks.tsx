"use client";

import { useState } from "react";
import { ShieldAlert, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/page-loader";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

import { useGetRisks, useDeleteRisk } from "../api/use-risks";
import { useCreateRiskModal, useEditRiskModal } from "../hooks/use-risk-modals";
import { CreateRiskModal, EditRiskModal } from "./risk-modals";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";

export const ProjectRisks = ({ projectId }: { projectId: string }) => {
  const workspaceId = useWorkspaceId();
  const { data: risks, isLoading } = useGetRisks(projectId);
  const { open: openCreateModal } = useCreateRiskModal();
  const { open: openEditModal } = useEditRiskModal();
  const { mutate: deleteRisk } = useDeleteRisk();

  const [ConfirmDialog, confirm] = useConfirm("Delete Risk", "Are you sure? This cannot be undone.", "destructive");
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (ok) deleteRisk({ id, workspaceId });
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case "CRITICAL": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "HIGH": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "MEDIUM": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
  };

  if (isLoading) return <div className="h-[400px] flex items-center justify-center"><PageLoader /></div>;

  return (
    <div className="w-full flex flex-col gap-6">
      <CreateRiskModal projectId={projectId} workspaceId={workspaceId} />
      <EditRiskModal projectId={projectId} workspaceId={workspaceId} risks={risks || []} />
      <ConfirmDialog />

      {/* VIEW RISK MODAL */}
      <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <div className="flex items-start justify-between w-full pr-6">
               <DialogTitle className="text-lg font-bold pr-2 leading-tight">
                 {selectedRisk?.title}
               </DialogTitle>
               <Badge variant={selectedRisk?.status === "OPEN" ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                 {selectedRisk?.status.replace('_', ' ')}
               </Badge>
            </div>
            <DialogDescription className="text-xs pt-2 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border font-semibold ${selectedRisk ? getRiskColor(selectedRisk.probability) : ''}`}>
                Probability: {selectedRisk?.probability}
              </span>
              <span className={`px-2 py-0.5 rounded border font-semibold ${selectedRisk ? getRiskColor(selectedRisk.impact) : ''}`}>
                Impact: {selectedRisk?.impact}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2 text-foreground">Detailed Mitigation Plan</h4>
            <div className="bg-muted/30 p-4 rounded-lg border text-sm text-muted-foreground whitespace-pre-wrap max-h-[40vh] overflow-y-auto custom-scrollbar">
               {selectedRisk?.mitigation || <span className="italic opacity-50">No plan documented.</span>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MemberAvatar name={selectedRisk?.reportedBy?.name} src={selectedRisk?.reportedBy?.image} className="size-6" />
                <span>Reported by <span className="font-semibold text-foreground">{selectedRisk?.reportedBy?.name || 'Unknown'}</span> on {selectedRisk ? format(new Date(selectedRisk.createdAt), "MMM d, yyyy") : ''}</span>
             </div>
             <DialogClose asChild>
                <Button variant="outline" size="sm">Close</Button>
             </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="size-5 text-amber-600" /> Risk Register</h2>
          <p className="text-sm text-muted-foreground mt-1">Identify and track potential threats to project success.</p>
        </div>
        <Button onClick={openCreateModal} size="sm"><Plus className="size-4 mr-2" /> Log Risk</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {risks?.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-card border border-dashed rounded-xl">
            <ShieldAlert className="size-8 opacity-20 mb-2" />
            <p>No risks logged yet.</p>
          </div>
        )}

        {risks?.map((risk: any) => (
          <Card key={risk.id} className="p-5 bg-card flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base truncate" title={risk.title}>{risk.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getRiskColor(risk.probability)}`}>Prob: {risk.probability}</Badge>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getRiskColor(risk.impact)}`}>Impact: {risk.impact}</Badge>
                </div>
              </div>
              <Badge variant={risk.status === "OPEN" ? "destructive" : "secondary"} className="shrink-0 text-[9px] uppercase leading-none py-1">
                {risk.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border mt-4 flex flex-col flex-1 h-[88px]">
              <span className="font-semibold block mb-1 text-foreground text-xs">Mitigation Plan:</span>
              <div className="flex-1 overflow-hidden relative">
                 <p className="line-clamp-2 text-xs leading-relaxed">
                   {risk.mitigation || <span className="italic opacity-50">No plan documented.</span>}
                 </p>
              </div>
              {(risk.mitigation && risk.mitigation.length > 80) && (
                <button 
                  onClick={() => setSelectedRisk(risk)} 
                  className="text-[10px] font-bold text-primary self-start hover:underline mt-1 flex items-center"
                >
                  <Eye className="size-3 mr-1" /> View Full Plan
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-3 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate pr-2">
                <MemberAvatar name={risk.reportedBy?.name} src={risk.reportedBy?.image} className="size-5 shrink-0" />
                <span className="truncate">{format(new Date(risk.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="size-7 hover:bg-muted" onClick={() => openEditModal(risk.id)}>
                  <Edit2 className="size-3" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(risk.id)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};