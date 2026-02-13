"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import ProjectAnalytics from "@/features/projects/components/project-analytics";
import { PageLoader } from "@/components/page-loader";

export const AnalyticsPage = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetDummyProjects(workspaceId);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.documents && data.documents.length > 0 && !selectedProjectId) {
      setSelectedProjectId(data.documents[0].id);
    }
  }, [data, selectedProjectId]);

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleExportPDF = async () => {
    if (!printRef.current || !selectedProjectId) return;
    
    const project = data?.documents.find(p => p.id === selectedProjectId);
    const fileName = project ? project.name.replace(/\s+/g, "_") : "Project";

    setIsExporting(true);
    
    try {
      const element = printRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight 
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const imgH = (imgHeight * pdfWidth) / imgWidth;

      let heightLeft = imgH;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgH);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgH);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${fileName}_Analytics_Report.pdf`);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="w-full bg-slate-50/50 min-h-screen p-6">

      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="w-full sm:w-[300px]">
          <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
            <SelectTrigger className="w-full bg-white border-slate-200 h-10 shadow-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {data?.documents.map((project) => (
                <SelectItem key={project.id} value={project.id} className="cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <ProjectAvatar 
                      name={project.name} 
                      image={project.imageUrl} 
                      className="size-6"
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExportPDF} 
          disabled={isExporting || !selectedProjectId}
          className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
        >
          {isExporting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" /> Generating PDF...
            </>
          ) : (
            <>
              <Download className="size-4 mr-2" /> Download PDF Report
            </>
          )}
        </Button>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-7xl mx-auto overflow-hidden">
        {selectedProjectId ? (
          <ProjectAnalytics projectId={selectedProjectId} />
        ) : (
          <div className="p-12 text-center text-slate-500">
            Please select a project to view analytics.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;