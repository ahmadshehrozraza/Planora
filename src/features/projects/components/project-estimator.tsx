"use client";

import React, { useState, useEffect } from "react";
import { Calculator, Save, BrainCircuit, Users, Clock, Banknote, Calendar, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateCOCOMO, ProjectType } from "../hooks/cocomo-utils";
import { updateProjectEstimations } from "../server/update-estimations";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { FpaCalculatorModal } from "./fpa-calculator-modal";

interface ProjectEstimatorProps {
  projectId: string;
  initialData: any;
}

export const ProjectEstimator = ({ projectId, initialData }: ProjectEstimatorProps) => {
  const workspaceId = useWorkspaceId();
  
  const [kloc, setKloc] = useState<number | string>(initialData?.estimatedKloc || "");
  const [projectType, setProjectType] = useState<ProjectType>("ORGANIC");
  const [avgResourceCost, setAvgResourceCost] = useState<number | string>(initialData?.avgResourceCost || ""); 
  const [isSaving, setIsSaving] = useState(false);
  const [isFpaModalOpen, setIsFpaModalOpen] = useState(false);

  const [fpaState, setFpaState] = useState(initialData?.fpaMetadata || {
    counts: { EI: 0, EO: 0, EQ: 0, ILF: 0, EIF: 0 },
    selectedLangs: ["Next.js / React / Vue (Frontend)"]
  });

  const [estimates, setEstimates] = useState({ 
    effort: initialData?.calculatedEffort || 0, 
    duration: 0, 
    staff: 0, 
    cost: initialData?.calculatedCost || 0 
  });

  useEffect(() => {
    if (kloc && avgResourceCost) {
      setEstimates(calculateCOCOMO(Number(kloc), projectType, Number(avgResourceCost)));
    }
  }, [kloc, projectType, avgResourceCost]);

  const handleSave = async () => {
    if (!kloc || !avgResourceCost) {
      toast.error("KLOC aur Resource Cost fill karna zaroori hai.");
      return;
    }

    setIsSaving(true);
    const res = await updateProjectEstimations({
      projectId,
      workspaceId,
      estimatedKloc: Number(kloc),
      calculatedEffort: estimates.effort,
      calculatedCost: estimates.cost,
      avgResourceCost: Number(avgResourceCost),
      fpaMetadata: fpaState
    });

    setIsSaving(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Estimations baseline ke saved");
    }
  };

  const handleFpaApply = (calculatedKloc: number, finalFpaState: any) => {
    setKloc(calculatedKloc);
    setFpaState(finalFpaState);
    toast.success("FPA Calculation applied!");
  };

  const currency = initialData?.currency || "PKR";

  return (
    <div className="flex flex-col gap-6">
      <FpaCalculatorModal 
        isOpen={isFpaModalOpen} 
        setIsOpen={setIsFpaModalOpen} 
        onApply={handleFpaApply}
        initialState={fpaState}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-muted-foreground font-semibold">Estimated KLOC <span className="text-red-500">*</span></Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] text-blue-600 bg-blue-500/10 hover:bg-blue-500/20"
              onClick={() => setIsFpaModalOpen(true)}
            >
              <Wand2 className="size-3 mr-1" /> Use FPA Wizard
            </Button>
          </div>
          <div className="relative">
            <Input 
              type="number" 
              min={0}
              step="0.01" 
              value={kloc} 
              placeholder="e.g. 50"
              onChange={(e) => setKloc(e.target.value)} 
              className="pl-8 bg-background" 
            />
            <Calculator className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          </div>
          <p className="text-[10px] text-destructive font-medium">Note: 50,000 lines ke liye sirf 50 enter karein.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground font-semibold">Complexity Model <span className="text-red-500">*</span></Label>
          <Select value={projectType} onValueChange={(val) => setProjectType(val as ProjectType)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ORGANIC">Organic (Simple)</SelectItem>
              <SelectItem value="SEMI_DETACHED">Semi-Detached (Average)</SelectItem>
              <SelectItem value="EMBEDDED">Embedded (Complex)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground font-semibold">Avg. Resource Cost / Month ({currency}) <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="e.g. 150000"
              min={0}
              step="1000" 
              value={avgResourceCost} 
              onChange={(e) => setAvgResourceCost(e.target.value)} 
              className="bg-background" 
            />
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl p-6 relative overflow-hidden">
        <BrainCircuit className="absolute -right-6 -top-6 size-32 text-primary/5 rotate-12" />
        
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Saved AI Projections</h3>
            {initialData?.estimatedKloc && (
                <div className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded border border-emerald-500/20 font-bold uppercase">
                    Currently Active Baseline
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-none border-none bg-blue-500/10">
            <CardContent className="p-4 flex flex-col items-center text-center justify-center">
              <Clock className="size-6 text-blue-600 mb-2" />
              <span className="text-sm text-muted-foreground font-medium">Effort Required</span>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{estimates.effort}</span>
              <span className="text-xs text-muted-foreground">Person-Months</span>
            </CardContent>
          </Card>

          <Card className="shadow-none border-none bg-amber-500/10">
            <CardContent className="p-4 flex flex-col items-center text-center justify-center">
              <Calendar className="size-6 text-amber-600 mb-2" />
              <span className="text-sm text-muted-foreground font-medium">Estimated Time</span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{estimates.duration || "N/A"}</span>
              <span className="text-xs text-muted-foreground">Months</span>
            </CardContent>
          </Card>

          <Card className="shadow-none border-none bg-emerald-500/10">
            <CardContent className="p-4 flex flex-col items-center text-center justify-center">
              <Users className="size-6 text-emerald-600 mb-2" />
              <span className="text-sm text-muted-foreground font-medium">Team Size</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{estimates.staff || "N/A"}</span>
              <span className="text-xs text-muted-foreground">Developers</span>
            </CardContent>
          </Card>

          <Card className="shadow-none border-none bg-purple-500/10">
            <CardContent className="p-4 flex flex-col items-center text-center justify-center">
              <Banknote className="size-6 text-purple-600 mb-2" />
              <span className="text-sm text-muted-foreground font-medium">Est. Dev Cost</span>
              <span className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">
                {currency} {estimates.cost.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !kloc || !avgResourceCost} className="bg-primary hover:bg-primary/90 min-w-[150px]">
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Update Baseline"}
          </Button>
        </div>
      </div>
    </div>
  );
};