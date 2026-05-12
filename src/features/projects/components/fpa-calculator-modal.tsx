"use client";

import React, { useState, useEffect } from "react";
import { Calculator, CheckCircle2, MonitorUp, FileText, Search, Database, Webhook } from "lucide-react";

import { ResponsiveModal } from "@/components/responsive-model";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { calculateFPA, LANGUAGE_FACTORS } from "../hooks/fpa-utils";

interface FpaCalculatorModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onApply: (kloc: number, fpaState: any) => void;
  initialState: any;
}

export const FpaCalculatorModal = ({ isOpen, setIsOpen, onApply, initialState }: FpaCalculatorModalProps) => {
  const [counts, setCounts] = useState(initialState?.counts || { EI: 0, EO: 0, EQ: 0, ILF: 0, EIF: 0 });
  
  const [selectedLangs, setSelectedLangs] = useState<string[]>(
    initialState?.selectedLangs || ["Next.js / React / Vue (Frontend)"]
  ); 
  
  const [result, setResult] = useState({ totalFP: 0, totalLOC: 0, kloc: 0 });

  useEffect(() => {
    if (isOpen && initialState) {
      setCounts(initialState.counts);
      setSelectedLangs(initialState.selectedLangs || ["Next.js / React / Vue (Frontend)"]);
    }
  }, [isOpen, initialState]);

  useEffect(() => {
    const factors = selectedLangs.map(lang => LANGUAGE_FACTORS[lang] || 50);
    const avgFactor = factors.length > 0 ? factors.reduce((a, b) => a + b, 0) / factors.length : 50;
    
    setResult(calculateFPA(counts, avgFactor));
  }, [counts, selectedLangs]);

  const handleUpdate = (field: keyof typeof counts, value: string) => {
    setCounts((prev: any) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs(prev => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev; 
        return prev.filter(l => l !== lang);
      }
      return [...prev, lang];
    });
  };

  const handleApply = () => {
    if (result.kloc > 0) {
      onApply(result.kloc, { counts, selectedLangs });
      setIsOpen(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="size-5 text-primary" /> FPA Wizard
          </CardTitle>
          <CardDescription>Counts are preserved securely in your project baseline.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs"><MonitorUp className="size-3 text-blue-500" /> Inputs</Label>
              <Input type="number" value={counts.EI || ""} onChange={(e) => handleUpdate("EI", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs"><FileText className="size-3 text-emerald-500" /> Outputs</Label>
              <Input type="number" value={counts.EO || ""} onChange={(e) => handleUpdate("EO", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs"><Search className="size-3 text-amber-500" /> Inquiries</Label>
              <Input type="number" value={counts.EQ || ""} onChange={(e) => handleUpdate("EQ", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs"><Database className="size-3 text-purple-500" /> DB Tables</Label>
              <Input type="number" value={counts.ILF || ""} onChange={(e) => handleUpdate("ILF", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5 text-xs"><Webhook className="size-3 text-rose-500" /> External APIs</Label>
              <Input type="number" value={counts.EIF || ""} onChange={(e) => handleUpdate("EIF", e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold">Project Tech Stack (Select Multiple)</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LANGUAGE_FACTORS).map(([name, factor]) => {
                const isSelected = selectedLangs.includes(name);
                return (
                  <Badge 
                    key={name} 
                    variant={isSelected ? "default" : "secondary"}
                    className={`cursor-pointer hover:bg-primary/80 ${isSelected ? "" : "opacity-60"}`}
                    onClick={() => toggleLang(name)}
                  >
                    {name}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg flex items-center justify-between mt-2">
            <p className="text-sm font-medium">Calculated Size</p>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{result.kloc}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">KLOC</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={result.kloc <= 0} className="bg-primary">
              <CheckCircle2 className="size-4 mr-2" /> Update KLOC
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};